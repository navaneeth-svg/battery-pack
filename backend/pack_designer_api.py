"""
Battery Pack Designer API
Extracted from main BatteryScope backend

This module contains the battery pack design algorithm endpoint.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import requests
import json

app = Flask(__name__)
CORS(app)

# VPS Storage Configuration
VPS_STORAGE_URL = "https://dev2.thinkclock.com/optv1"
REQUEST_TIMEOUT = 30  # seconds
ML_CLIENT_ID = "internal"  # Authentication for VPS storage


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'battery-pack-designer',
        'vps_storage': VPS_STORAGE_URL
    }), 200


@app.route('/fetch-inventory', methods=['GET'])
def fetch_inventory():
    """
    Fetch cell inventory from optv1 VPS storage for pack design
    
    Query Parameters:
    - sample_type: 'training' or 'prediction' (default: 'training')
    - limit: Maximum number of cells to return (default: 500)
    
    Returns:
    - cells: List of available cells with capacity, SOH, IR, etc.
    """
    try:
        sample_type = request.args.get('sample_type', 'training')
        limit = int(request.args.get('limit', 500))
        
        print(f"🔍 Fetching {sample_type} inventory from VPS storage...")
        print(f"   URL: {VPS_STORAGE_URL}/api/raw-files")
        
        # Fetch files from VPS storage
        response = requests.get(
            f'{VPS_STORAGE_URL}/api/raw-files',
            params={
                'sort_by': 'modified',
                'order': 'desc',
                'page': 1,
                'page_size': limit
            },
            headers={'X-Client-Id': ML_CLIENT_ID},
            timeout=REQUEST_TIMEOUT
        )
        print(f"   Response status: {response.status_code}")
        
        if response.status_code != 200:
            return jsonify({
                'success': False,
                'error': f'VPS storage returned status {response.status_code}'
            }), 500
        
        result = response.json()
        
        if result.get('status') != 'success':
            return jsonify({
                'success': False,
                'error': 'VPS storage API error'
            }), 500
        
        all_files = result.get('data', {}).get('files', [])
        
        # Filter by sample type - look for files starting with "training_daq" or "prediction_daq"
        if sample_type == 'training':
            filtered_files = [
                f for f in all_files 
                if f.get('original_file_name', '').lower().startswith('training_daq')
            ]
        else:
            filtered_files = [
                f for f in all_files 
                if f.get('original_file_name', '').lower().startswith('prediction_daq')
            ]
        
        print(f"✅ Found {len(filtered_files)} {sample_type}_daq files")
        
        # Try to fetch metadata.json for enriched cell data
        metadata_dict = fetch_metadata_from_vps(sample_type)
        if metadata_dict:
            print(f"📖 Loaded {len(metadata_dict)} entries from {sample_type}_metadata.json")
        else:
            print(f"ℹ️ No metadata.json available, using filename parsing only")
        
        # Convert VPS files to cell inventory format
        cells = []
        for idx, file_entry in enumerate(filtered_files):
            try:
                original_name = file_entry.get('original_file_name', '')
                
                # Parse metadata from filename
                metadata = parse_filename_metadata(original_name)
                
                # Enrich with metadata.json if available
                if metadata_dict:
                    # Try multiple key formats since metadata.json is inconsistent:
                    # 1. Original with leading zeros: "0524_timestamp"
                    # 2. Stripped version: "524_timestamp"
                    uid_original = metadata.get('uid')
                    uid_stripped = str(int(uid_original)) if uid_original else None
                    timestamp = metadata.get('timestamp')
                    
                    json_metadata = None
                    # Try original format first
                    metadata_key = f"{uid_original}_{timestamp}"
                    if metadata_key in metadata_dict:
                        json_metadata = metadata_dict[metadata_key]
                    # Try stripped format if original not found
                    elif uid_stripped and uid_stripped != uid_original:
                        metadata_key_alt = f"{uid_stripped}_{timestamp}"
                        if metadata_key_alt in metadata_dict:
                            json_metadata = metadata_dict[metadata_key_alt]
                    
                    if json_metadata:
                        # Get SOH - try predicted_soh first, fall back to soh
                        if json_metadata.get('predicted_soh'):
                            metadata['soh'] = json_metadata['predicted_soh']
                        elif json_metadata.get('soh'):
                            metadata['soh'] = json_metadata['soh']
                        
                        # Get capacity - try predicted_capacity first, fall back to capacity
                        if json_metadata.get('predicted_capacity'):
                            metadata['capacity'] = json_metadata['predicted_capacity']
                        elif json_metadata.get('capacity'):
                            metadata['capacity'] = json_metadata['capacity']
                        
                        # Get OCV and IR - prefer filename values, but accept JSON even if None
                        if 'ocv' in json_metadata and not metadata.get('ocv'):
                            metadata['ocv'] = json_metadata['ocv']  # Accept even if None
                        if 'ir' in json_metadata and not metadata.get('ir'):
                            metadata['ir'] = json_metadata['ir']  # Accept even if None/0
                
                cell = {
                    'id': file_entry.get('file_id'),
                    'uid': metadata.get('uid', f'cell_{idx+1}'),
                    'barcode': metadata.get('uid', f'cell_{idx+1}'),
                    'capacity': metadata.get('capacity'),
                    'soh': metadata.get('soh'),
                    'ir': metadata.get('ir'),
                    'ocv': metadata.get('ocv'),
                    'voltage': metadata.get('ocv') or 3.7,  # Default to 3.7V if None
                    'type': 'Cylindrical',  # Default type
                    'condition': 'Recycled' if sample_type == 'prediction' else 'New',
                    'timestamp': file_entry.get('modified_at'),
                    'file_name': original_name,
                    'file_size': file_entry.get('size_bytes', 0)
                }
                
                # Only include cells with predicted SOH and capacity (from metadata.json)
                # Skip cells without metadata - they haven't been predicted yet
                if cell['soh'] and cell['capacity']:
                    cells.append(cell)
                else:
                    print(f"⏭️ Skipping unpredicted cell: {metadata.get('uid')} (no SOH/capacity in metadata)")
                    
            except Exception as e:
                print(f"⚠️ Error parsing file {original_name}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        print(f"📊 Returning {len(cells)} valid cells for pack design")
        
        # Debug: Show sample cell data
        if cells:
            sample = cells[0]
            print(f"🔍 Sample cell: UID={sample.get('uid')}, SOH={sample.get('soh')}, Capacity={sample.get('capacity')}, IR={sample.get('ir')}, OCV={sample.get('ocv')}")
        
        return jsonify({
            'success': True,
            'cells': cells,
            'total_files': len(filtered_files),
            'valid_cells': len(cells),
            'sample_type': sample_type
        }), 200
        
    except requests.Timeout:
        print(f"⏱️ VPS storage request timeout")
        return jsonify({
            'success': False,
            'error': 'VPS storage request timeout'
        }), 504
    except Exception as e:
        print(f"❌ Error fetching inventory: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


def fetch_metadata_from_vps(sample_type='training'):
    """
    Fetch metadata.json from local file or VPS storage if available
    Priority: Local file → VPS → None
    
    Args:
        sample_type: 'training' or 'prediction'
    
    Returns:
        dict: Metadata dictionary keyed by "UID_timestamp", or None if not available
    """
    try:
        import os
        metadata_filename = f"{sample_type}_metadata.json"
        
        # Check for local file first (in same directory as this script)
        local_path = os.path.join(os.path.dirname(__file__), metadata_filename)
        if os.path.exists(local_path):
            print(f"📁 Loading {metadata_filename} from local file...")
            with open(local_path, 'r', encoding='utf-8') as f:
                metadata_dict = json.load(f)
                print(f"✅ Successfully loaded {len(metadata_dict)} entries from local file")
                return metadata_dict
        
        # Fall back to VPS if local file not found
        print(f"🔍 Local file not found, attempting to fetch {metadata_filename} from VPS...")
        
        # Check if the file exists in VPS
        response = requests.get(
            f'{VPS_STORAGE_URL}/api/raw-files',
            params={
                'sort_by': 'modified',
                'order': 'desc',
                'page': 1,
                'page_size': 100
            },
            headers={'X-Client-Id': ML_CLIENT_ID},
            timeout=REQUEST_TIMEOUT
        )
        
        if response.status_code == 200:
            result = response.json()
            files = result.get('data', {}).get('files', [])
            
            # Look for metadata.json file
            metadata_file = None
            for f in files:
                if f.get('original_file_name', '').lower() == metadata_filename:
                    metadata_file = f
                    break
            
            if metadata_file:
                # Download the metadata.json content
                file_id = metadata_file.get('file_id')
                download_url = f"{VPS_STORAGE_URL}/api/raw-files/{file_id}/download"
                
                download_response = requests.get(
                    download_url,
                    headers={'X-Client-Id': ML_CLIENT_ID},
                    timeout=REQUEST_TIMEOUT
                )
                
                if download_response.status_code == 200:
                    metadata_dict = download_response.json()
                    print(f"✅ Successfully fetched {metadata_filename}")
                    return metadata_dict
        
        print(f"ℹ️ {metadata_filename} not found on VPS, will use filename parsing")
        return None
        
    except Exception as e:
        print(f"⚠️ Error fetching metadata.json: {e}")
        return None


def parse_filename_metadata(filename):
    """
    Parse cell metadata from DAQ filename
    Format: daq_YYYYMMDD_HHMMSS_cell1_BARCODE_OCV{ocv}_IR{ir}.csv
    """
    import re
    
    metadata = {
        'uid': None,
        'timestamp': None,
        'ocv': None,
        'ir': None,
        'soh': None,
        'capacity': None
    }
    
    # Extract barcode/UID (2-6 digit number after cell1/cell2)
    # Training files: cell1_0038 (4 digits)
    # Prediction files: cell1_000123 (6 digits)
    uid_match = re.search(r'cell[12]_(\d{2,6})', filename)
    if uid_match:
        # Store original UID with leading zeros for metadata lookup
        metadata['uid'] = uid_match.group(1)
    
    # Extract timestamp
    timestamp_match = re.search(r'(\d{8}_\d{6})', filename)
    if timestamp_match:
        metadata['timestamp'] = timestamp_match.group(1)
    
    # Extract OCV
    ocv_match = re.search(r'OCV(\d+(?:\.\d+)?)', filename)
    if ocv_match:
        metadata['ocv'] = float(ocv_match.group(1))
    
    # Extract IR
    ir_match = re.search(r'IR(\d+(?:\.\d+)?)', filename)
    if ir_match:
        metadata['ir'] = float(ir_match.group(1))
    
    # Extract SOH (if present in prediction files)
    soh_match = re.search(r'SOH(\d+(?:\.\d+)?)', filename)
    if soh_match:
        metadata['soh'] = float(soh_match.group(1))
    
    # Extract Capacity (if present)
    cap_match = re.search(r'Cap(\d+(?:\.\d+)?)', filename)
    if cap_match:
        metadata['capacity'] = float(cap_match.group(1))
    
    # If no capacity but has SOH, estimate capacity (assuming 2.5Ah nominal)
    if not metadata['capacity'] and metadata['soh']:
        metadata['capacity'] = 2.5 * (metadata['soh'] / 100.0)
    
    # If no SOH but has capacity, estimate SOH
    if not metadata['soh'] and metadata['capacity']:
        metadata['soh'] = (metadata['capacity'] / 2.5) * 100.0
    
    return metadata


@app.route('/design-battery-pack', methods=['POST'])
def design_battery_pack():
    """
    Enhanced battery pack design algorithm
    Groups cells by composite scoring (capacity, SOH, IR) and distributes optimally
    
    Parameters:
    - cells: List of cell objects with properties (capacity, soh, ir, etc.)
    - num_series: Number of cells in series
    - num_parallel: Number of parallel strings
    
    Returns:
    - pack_matrix: 2D array of cells organized in pack
    - column_totals: Aggregate stats per parallel string
    - statistics: Overall pack performance metrics
    - warnings: Any design warnings or issues
    """
    try:
        data = request.get_json()
        cells = data.get('cells', [])
        num_series = data.get('num_series', 7)
        num_parallel = data.get('num_parallel', 22)
        
        # Weighting factors for composite score
        capacity_weight = 0.4
        soh_weight = 0.4
        ir_weight = 0.2
        
        if not cells:
            return jsonify({
                'success': False,
                'error': 'No cells provided'
            }), 400
        
        total_cells_needed = num_series * num_parallel
        
        # Log if insufficient cells, but keep original configuration and fill with empty cells
        if len(cells) < total_cells_needed:
            print(f"⚠️ Insufficient cells: need {total_cells_needed}, have {len(cells)}")
            print(f"Keeping original {num_series}S{num_parallel}P configuration - will fill {total_cells_needed - len(cells)} positions with empty cells")
        
        print(f"Designing {num_series}S{num_parallel}P pack from {len(cells)} cells (target: {total_cells_needed})...")
        
        # Calculate composite score for each cell
        # Normalize values first - handle None values with 'or' operator
        capacities = [float(c.get('predicted_capacity') or c.get('capacity') or 4000) for c in cells]
        sohs = [float(c.get('predicted_soh') or c.get('soh') or 95) for c in cells]
        irs = [float(c.get('ir') or 45) for c in cells]  # Use 'or' to handle None values
        
        max_capacity = max(capacities) if capacities else 1
        max_soh = max(sohs) if sohs else 1
        min_ir = min(irs) if irs else 1
        
        for i, cell in enumerate(cells):
            capacity_norm = capacities[i] / max_capacity if max_capacity > 0 else 0
            soh_norm = sohs[i] / max_soh if max_soh > 0 else 0
            # Inverse for IR (lower is better)
            ir_norm = min_ir / irs[i] if irs[i] > 0 else 0
            
            # Composite score (0-100 scale)
            score = (capacity_weight * capacity_norm + 
                    soh_weight * soh_norm + 
                    ir_weight * ir_norm) * 100
            
            cell['composite_score'] = score
        
        # Sort cells by composite score (descending)
        sorted_cells = sorted(cells, key=lambda x: x.get('composite_score', 0), reverse=True)
        
        # Group cells by score (bins of 5 points)
        score_groups = {}
        for cell in sorted_cells:
            score = cell.get('composite_score', 0)
            group_key = int(score / 5) * 5  # Round down to nearest 5
            if group_key not in score_groups:
                score_groups[group_key] = []
            score_groups[group_key].append(cell)
        
        # Distribute cells using round-robin to balance parallel strings (columns)
        cell_columns = [[] for _ in range(num_parallel)]
        col_idx = 0
        
        for group_key in sorted(score_groups.keys(), reverse=True):
            for cell in score_groups[group_key]:
                if len(cell_columns[col_idx]) < num_series:
                    cell_columns[col_idx].append(cell)
                    col_idx = (col_idx + 1) % num_parallel
                    
                    # Check if pack is complete
                    if all(len(col) == num_series for col in cell_columns):
                        break
            if all(len(col) == num_series for col in cell_columns):
                break
        
        # Build battery pack matrix (rows = series blocks, cols = parallel strings)
        pack_matrix = []
        column_totals = {'capacity': [0] * num_parallel, 'soh': [0] * num_parallel, 'ir': [0] * num_parallel}
        column_cell_counts = [0] * num_parallel  # Track actual cells per column
        
        for series_idx in range(num_series):
            row = []
            for col_idx in range(num_parallel):
                if series_idx < len(cell_columns[col_idx]):
                    cell = cell_columns[col_idx][series_idx]
                    row.append(cell)
                    
                    # Accumulate column totals - handle None values properly
                    column_totals['capacity'][col_idx] += float(cell.get('predicted_capacity') or cell.get('capacity') or 0)
                    column_totals['soh'][col_idx] += float(cell.get('predicted_soh') or cell.get('soh') or 0)
                    column_totals['ir'][col_idx] += float(cell.get('ir') or 0)
                    column_cell_counts[col_idx] += 1
                else:
                    row.append(None)
            pack_matrix.append(row)
        
        # Calculate statistics
        selected_cells = [cell for row in pack_matrix for cell in row if cell]
        empty_cells = total_cells_needed - len(selected_cells)
        
        total_capacity = sum(column_totals['capacity']) / num_parallel  # Average capacity per string
        avg_soh = sum(column_totals['soh']) / len(selected_cells) if selected_cells else 0
        avg_ir = sum(column_totals['ir']) / len(selected_cells) if selected_cells else 0
        
        # Calculate capacity spread and warnings
        col_capacities = column_totals['capacity']
        capacity_spread = max(col_capacities) - min(col_capacities) if col_capacities else 0
        capacity_cv = (np.std(col_capacities) / np.mean(col_capacities) * 100) if col_capacities and np.mean(col_capacities) > 0 else 0
        
        # Calculate average IR per column (accounting for actual cell count)
        col_irs = [column_totals['ir'][i] / column_cell_counts[i] if column_cell_counts[i] > 0 else 0 for i in range(num_parallel)]
        ir_spread = max(col_irs) - min(col_irs) if col_irs else 0
        
        warnings = []
        if empty_cells > 0:
            warnings.append(f"⚠️ Insufficient inventory: {empty_cells} empty cell positions in pack (need {total_cells_needed}, have {len(selected_cells)})")
        if capacity_spread > 500:  # More than 500mAh difference
            warnings.append(f"⚠️ High capacity spread: {capacity_spread:.0f}mAh between parallel strings")
        if ir_spread > 10:  # More than 10Ω difference
            warnings.append(f"⚠️ High IR spread: {ir_spread:.1f}Ω between parallel strings")
        if capacity_cv > 3:  # More than 3% coefficient of variation
            warnings.append(f"⚠️ Capacity variation: {capacity_cv:.1f}% CV")
        
        result = {
            'success': True,
            'pack_matrix': pack_matrix,
            'column_totals': column_totals,
            'statistics': {
                'configuration': f'{num_series}S{num_parallel}P',
                'total_cells': len(selected_cells),
                'pack_capacity_mah': total_capacity,
                'pack_capacity_ah': total_capacity / 1000,
                'avg_soh': avg_soh,
                'avg_ir': avg_ir,
                'capacity_spread_mah': capacity_spread,
                'capacity_cv_percent': capacity_cv,
                'ir_spread_ohm': ir_spread,
                'nominal_voltage': num_series * 3.7,
                'energy_wh': (num_series * 3.7 * total_capacity) / 1000,
                'utilization_percent': (len(selected_cells) / len(cells)) * 100 if cells else 0
            },
            'warnings': warnings
        }
        
        print(f"✓ Pack design complete: {num_series}S{num_parallel}P, {total_capacity:.0f}mAh avg, {len(warnings)} warnings")
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Pack design error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/batteries/<path:endpoint>', methods=['GET', 'POST'])
def batteries_stub(endpoint):
    """
    Stub endpoint for compatibility with main app's BatteryCellPlots
    Returns empty data since this functionality is not needed for pack design
    """
    print(f"ℹ️ Stub endpoint called: /batteries/{endpoint}")
    return jsonify({
        'success': True,
        'message': 'This endpoint is not implemented in battery-pack-designer',
        'data': {}
    }), 200


if __name__ == '__main__':
    print("🚀 Battery Pack Designer API starting...")
    print("📍 Endpoints:")
    print("   - GET  /health")
    print("   - GET  /fetch-inventory")
    print("   - POST /design-battery-pack")
    print("   - *    /batteries/* (stub for compatibility)")
    print(f"🔗 VPS Storage: {VPS_STORAGE_URL}")
    app.run(host='0.0.0.0', port=5000, debug=True)
