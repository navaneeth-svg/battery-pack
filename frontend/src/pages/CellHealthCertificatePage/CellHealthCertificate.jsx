import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Typography, CircularProgress } from '@mui/material';
import { Download, Visibility, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ImpedanceGraph from '../../components/CellInfo/ImpedanceGraph';
import CircuitParameters from '../../components/CellInfo/CircuitParameters';
import HppcGraph from '../../components/CellInfo/HppcGraph';
import ChargeDischargeGraph from '../../components/CellInfo/ChargeDischargeGraph';
import CapacityVsCyclePlot from '../../components/CellInfo/CapacityVsCyclePlot';
import InternalResistanceVsCyclePlot from '../../components/CellInfo/InternalResistanceVsCyclePlot';
import CombinedCapacityResistancePlot from '../../components/CellInfo/CombinedCapacityResistancePlot';
import ChargeDischargePlot from '../../components/CellInfo/ChargeDischargePlot';
import { Loader } from '../../components/Loaders/loader';
import CellImage1 from '../../assets/cert/cellCertimg1.jpeg';
import CellImage2 from '../../assets/cert/cellCertimg2.jpeg';
import CellImage3 from '../../assets/cert/cellCertimg3.jpeg';
import BarcodeImage from '../../assets/cert/barcode.png';

const staticCellId = '6697948e2f3802119cef0f21';

const CellHealthCertificate = () => {
  const certificateRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const urlUID = searchParams.get('uid');
  
  const [fetchedCellData, setFetchedCellData] = useState(null);
  const [isLoadingCellData, setIsLoadingCellData] = useState(false);
  
  const currentSOH = fetchedCellData?.predicted_soh || fetchedCellData?.soh || 90;
  const currentCapacity = fetchedCellData?.predicted_capacity || fetchedCellData?.capacity || ((currentSOH / 100) * 5000);

  const cellImages = [CellImage1, CellImage2, CellImage3];

  const calculateRUL = (soh) => {
    const EOL_CYCLE = 850;
    const cycleData = [0.0, 2.842809364548495, 5.68561872909699, 17.05685618729097, 19.899665551839465, 36.95652173913042, 51.17056856187289, 54.01337792642138, 56.85618729096988, 144.9832775919733, 147.82608695652178, 150.66889632107026, 153.51170568561875, 156.35451505016724, 159.19732441471572, 164.8829431438127, 167.72575250836118, 170.56856187290967, 204.6822742474915, 213.21070234113697, 218.89632107023397, 241.63879598662183, 244.48160535117032, 253.01003344481575, 255.85284280936423, 258.6956521739128, 261.53846153846126, 272.9096989966552, 275.7525083612037, 295.6521739130431, 298.4949832775916, 309.86622073578553, 312.709030100334, 315.5518394648825, 318.394648829431, 326.92307692307645, 335.4515050167219, 338.2943143812704, 341.1371237458189, 343.97993311036737, 346.82274247491586, 355.3511705685613, 358.1939799331098, 386.62207357859467, 389.4648829431432, 400.8361204013371, 403.6789297658856, 412.20735785953104, 415.05016722407953, 417.892976588628, 420.7357859531765, 423.578595317725, 426.4214046822735, 437.7926421404674, 440.6354515050159, 469.0635451505008, 471.90635451504926, 474.74916387959775, 477.59197324414623, 488.9632107023402, 491.8060200668887, 494.6488294314372, 497.4916387959856, 500.3344481605341, 523.0769230769222, 525.9197324414707, 528.7625418060193, 540.1337792642134, 577.0903010033445, 579.933110367893, 585.6187290969901, 588.4615384615387, 591.3043478260872, 594.1471571906358, 596.9899665551843, 622.5752508361212, 625.4180602006697, 628.2608695652183, 631.1036789297668, 633.9464882943154, 636.7892976588639, 639.6321070234125, 642.474916387961, 645.3177257525095, 673.745819397995, 676.5886287625435, 696.4882943143833, 699.3311036789319, 702.1739130434804, 705.016722408029, 707.8595317725775, 710.702341137126, 713.5451505016746, 716.3879598662231, 719.2307692307717, 724.9163879598688, 727.7591973244173, 730.6020066889658, 733.4448160535144, 736.2876254180629, 747.6588628762571, 750.5016722408056, 753.3444816053542, 756.1872909699027, 759.0301003344513, 761.8729096989998, 767.5585284280969, 770.4013377926454, 773.244147157194, 776.0869565217425, 784.6153846153882, 787.4581939799367, 790.3010033444853, 793.1438127090338, 795.9866220735823, 798.8294314381309, 801.6722408026794, 804.515050167228, 807.3578595317765, 810.200668896325, 813.0434782608736, 815.8862876254221, 818.7290969899707, 821.5719063545192, 824.4147157190678, 830.1003344481649, 832.9431438127134, 835.785953177262, 838.6287625418105, 841.471571906359, 844.3143812709076, 847.1571906354561, 850.0000000000047];
    const capacityData = [1.075, 1.075, 1.075, 1.075, 1.075, 1.072944550669216, 1.070889101338432, 1.070889101338432, 1.070889101338432, 1.0606118546845125, 1.0585564053537284, 1.0585564053537284, 1.0585564053537284, 1.0585564053537284, 1.0585564053537284, 1.0565009560229446, 1.0565009560229446, 1.0565009560229446, 1.0503346080305929, 1.0503346080305929, 1.0503346080305929, 1.046223709369025, 1.044168260038241, 1.042112810707457, 1.042112810707457, 1.042112810707457, 1.042112810707457, 1.040057361376673, 1.040057361376673, 1.033891013384321, 1.033891013384321, 1.0318355640535373, 1.0318355640535373, 1.0318355640535373, 1.0318355640535373, 1.0297801147227534, 1.0277246653919694, 1.0277246653919694, 1.0256692160611856, 1.0256692160611856, 1.0256692160611856, 1.0236137667304015, 1.0236137667304015, 1.0153919694072655, 1.0153919694072655, 1.009225621414914, 1.009225621414914, 1.00717017208413, 1.005114722753346, 1.003059273422562, 1.003059273422562, 1.003059273422562, 1.003059273422562, 1.0010038240917782, 1.0010038240917782, 0.9619502868068834, 0.9640057361376674, 0.9640057361376674, 0.9619502868068834, 0.9825047801147228, 0.9825047801147228, 0.9825047801147228, 0.9804493307839388, 0.9804493307839388, 0.9701720841300192, 0.9701720841300192, 0.9701720841300192, 0.9619502868068834, 0.941395793499044, 0.93934034416826, 0.937284894837476, 0.9352294455066922, 0.9331739961759082, 0.9311185468451244, 0.9311185468451244, 0.9105640535372848, 0.9105640535372848, 0.9085086042065008, 0.906453154875717, 0.9043977055449332, 0.8797323135755258, 0.875621414913958, 0.873565965583174, 0.8632887189292543, 0.8673996175908222, 0.8653441682600382, 0.840678776290631, 0.840678776290631, 0.8324569789674953, 0.8304015296367113, 0.8304015296367113, 0.8262906309751434, 0.8201242829827916, 0.8180688336520077, 0.8119024856596558, 0.8016252390057361, 0.7995697896749522, 0.7934034416826004, 0.7913479923518164, 0.7892925430210325, 0.7625717017208413, 0.7564053537284895, 0.7522944550669216, 0.7481835564053537, 0.737906309751434, 0.737906309751434, 0.7152963671128107, 0.7111854684512429, 0.7029636711281071, 0.6988527724665392, 0.6700764818355641, 0.6639101338432123, 0.6556883365200765, 0.6495219885277247, 0.6351338432122371, 0.6269120458891013, 0.6186902485659656, 0.6145793499043977, 0.5940248565965583, 0.5878585086042065, 0.5755258126195029, 0.5673040152963671, 0.5570267686424474, 0.5467495219885278, 0.540583173996176, 0.5118068833652007, 0.5076959847036329, 0.5056405353728489, 0.4789196940726578, 0.4789196940726578, 0.4748087954110899, 0.4460325047801147, 0.4460325047801147];
    
    const maxCapacity = Math.max(...capacityData);
    const scale = 5000 / maxCapacity;
    const scaledCapacity = capacityData.map(c => c * scale);
    const targetCapacity = (soh / 100) * 5000;

    let closestIndex = 0;
    let minDiff = Math.abs(scaledCapacity[0] - targetCapacity);

    for (let i = 1; i < scaledCapacity.length; i++) {
      const diff = Math.abs(scaledCapacity[i] - targetCapacity);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    const currentCycle = cycleData[closestIndex];
    return Math.round(EOL_CYCLE - currentCycle);
  };

  const currentRUL = calculateRUL(currentSOH);

  const [cellData, setCellData] = useState({
    battery_id: '',
    meta: {},
    electrical_properties: {},
    mechanical_properties: {},
    cell_images: [],
    cell_csvs: [],
  });
  const [ImpedanceCsvData, setImpedanceCsvData] = useState('');
  const [HppcCsvData, setHppcCsvData] = useState('');
  const [CycleCsvData, setCycleCsvData] = useState('');

  useEffect(() => {
    if (!urlUID) {
      console.log('No UID in URL, using default/context data');
      return;
    }

    const fetchCellData = async () => {
      setIsLoadingCellData(true);
      try {
        console.log(`Fetching cell data for UID: ${urlUID}`);
        const response = await axios.get(`http://localhost:5000/get-cell-by-uid/${urlUID}`);
        
        if (response.data.success) {
          console.log('✅ Cell data fetched:', response.data);
          setFetchedCellData(response.data);
        } else {
          console.error('❌ Failed to fetch cell data:', response.data.error);
        }
      } catch (error) {
        console.error('❌ Error fetching cell data:', error);
      } finally {
        setIsLoadingCellData(false);
      }
    };

    fetchCellData();
  }, [urlUID]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        .js-plotly-plot, .plotly {
          page-break-inside: avoid;
        }
        canvas {
          max-width: 100% !important;
          height: auto !important;
        }
      }
      
      .certificate-scroll {
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
      }
      
      .certificate-scroll::-webkit-scrollbar {
        width: 8px !important;
      }
      
      .certificate-scroll::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1) !important;
        border-radius: 4px !important;
      }
      
      .certificate-scroll::-webkit-scrollbar-thumb {
        background: #e8442d !important;
        border-radius: 4px !important;
      }
      
      .certificate-scroll::-webkit-scrollbar-thumb:hover {
        background: #ff6b35 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const downloadFile = async (file) => {
    const response = await axios.get(`http://localhost:5001/files/${file}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file);
    document.body.appendChild(link);
    link.click();
  };

  const generatePDF = async () => {
    if (!certificateRef.current) return;

    setIsGeneratingPDF(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const element = certificateRef.current;
      const originalBorderRadius = element.style.borderRadius;
      const originalPadding = element.style.padding;
      const originalBackground = element.style.background;
      const originalOverflow = element.style.overflow;
      const originalHeight = element.style.height;
      
      element.style.borderRadius = '0';
      element.style.padding = '0';
      element.style.background = '#000';
      element.style.overflow = 'visible';
      element.style.height = 'auto';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-certificate-content]');
          if (clonedElement) {
            clonedElement.style.borderRadius = '0';
            clonedElement.style.padding = '0';
            clonedElement.style.background = '#000';
            clonedElement.style.overflow = 'visible';
            clonedElement.style.height = 'auto';
            clonedElement.style.boxSizing = 'border-box';
          }
        }
      });

      element.style.borderRadius = originalBorderRadius;
      element.style.padding = originalPadding;
      element.style.background = originalBackground;
      element.style.overflow = originalOverflow;
      element.style.height = originalHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;
      const imgWidth = pdfWidth;
      const scale = imgWidth / imgWidthPx;
      const imgHeight = imgHeightPx * scale;

      let position = 0;
      let pageHeightLeft = imgHeight;
      let pageNum = 0;
      const pageHeight = pdfHeight;

      while (pageHeightLeft > 0) {
        if (pageNum > 0) pdf.addPage();
        const sourceY = (imgHeightPx * position) / imgHeight;
        const sourceHeight = (imgHeightPx * Math.min(pageHeight, pageHeightLeft)) / imgHeight;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imgWidthPx;
        tempCanvas.height = sourceHeight;
        tempCtx.drawImage(
          canvas,
          0, sourceY, imgWidthPx, sourceHeight,
          0, 0, imgWidthPx, sourceHeight
        );
        const pageImgData = tempCanvas.toDataURL('image/png');
        pdf.addImage(
          pageImgData,
          'PNG',
          0,
          0,
          imgWidth,
          (sourceHeight * scale)
        );
        position += pageHeight;
        pageHeightLeft -= pageHeight;
        pageNum++;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `CellHealthCertificate_${urlUID || 'unknown'}_${timestamp}.pdf`;
      pdf.save(filename);

      alert('Certificate PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generatePDFForViewer = async () => {
    if (!certificateRef.current) return;

    setIsGeneratingPDF(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const element = certificateRef.current;
      const originalBorderRadius = element.style.borderRadius;
      const originalPadding = element.style.padding;
      const originalBackground = element.style.background;
      const originalOverflow = element.style.overflow;
      const originalHeight = element.style.height;
      
      element.style.borderRadius = '0';
      element.style.padding = '0';
      element.style.background = '#000';
      element.style.overflow = 'visible';
      element.style.height = 'auto';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-certificate-content]');
          if (clonedElement) {
            clonedElement.style.borderRadius = '0';
            clonedElement.style.padding = '0';
            clonedElement.style.background = '#000';
            clonedElement.style.overflow = 'visible';
            clonedElement.style.height = 'auto';
            clonedElement.style.boxSizing = 'border-box';
          }
        }
      });

      element.style.borderRadius = originalBorderRadius;
      element.style.padding = originalPadding;
      element.style.background = originalBackground;
      element.style.overflow = originalOverflow;
      element.style.height = originalHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;
      const imgWidth = pdfWidth;
      const scale = imgWidth / imgWidthPx;
      const imgHeight = imgHeightPx * scale;

      let position = 0;
      let pageHeightLeft = imgHeight;
      let pageNum = 0;
      const pageHeight = pdfHeight;

      while (pageHeightLeft > 0) {
        if (pageNum > 0) pdf.addPage();
        const sourceY = (imgHeightPx * position) / imgHeight;
        const sourceHeight = (imgHeightPx * Math.min(pageHeight, pageHeightLeft)) / imgHeight;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imgWidthPx;
        tempCanvas.height = sourceHeight;
        tempCtx.drawImage(
          canvas,
          0, sourceY, imgWidthPx, sourceHeight,
          0, 0, imgWidthPx, sourceHeight
        );
        const pageImgData = tempCanvas.toDataURL('image/png');
        pdf.addImage(
          pageImgData,
          'PNG',
          0,
          0,
          imgWidth,
          (sourceHeight * scale)
        );
        position += pageHeight;
        pageHeightLeft -= pageHeight;
        pageNum++;
      }

      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
      
      setPdfBlobUrl(blobUrl);
      setShowPDFViewer(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
      borderRadius: '0',
      p: 0,
      m: 0,
      fontFamily: 'Bai Jamjuree',
      color: '#fff',
      minHeight: '100vh',
      height: '100%',
      position: 'relative',
      border: 'none',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>

      {isLoadingCellData && urlUID && (
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          padding: 4,
          borderRadius: 2,
          border: '2px solid #e8442d',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <CircularProgress sx={{ color: '#e8442d' }} size={60} />
          <Typography variant="h6" sx={{ color: '#fff', fontFamily: 'Bai Jamjuree' }}>
            Loading cell data for UID: {urlUID}...
          </Typography>
        </Box>
      )}

      {showPDFViewer ? (
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative'
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            pb: 2,
            borderBottom: '1px solid rgba(232, 68, 45, 0.2)'
          }}>
            <Typography variant="h5" sx={{ color: '#e8442d', fontWeight: 700, fontFamily: 'Bai Jamjuree' }}>
              Certificate PDF Viewer
            </Typography>
            <Button
              variant="contained"
              onClick={() => setShowPDFViewer(false)}
              sx={{
                background: 'linear-gradient(45deg, #e8442d, #ff6b35)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '20px',
                px: 3,
                py: 1,
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Close Viewer
            </Button>
          </Box>

          <Box sx={{
            flex: 1,
            border: '2px solid #e8442d',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#fff'
          }}>
            {pdfBlobUrl ? (
              <iframe
                src={pdfBlobUrl}
                width="100%"
                height="100%"
                style={{
                  border: 'none',
                  borderRadius: '10px'
                }}
                title="Cell Health Certificate PDF"
              />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress sx={{ color: '#e8442d' }} />
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowY: 'auto',
          position: 'relative',
          height: '100%',
          mb: 0
        }}>
          <Box
            ref={certificateRef}
            data-certificate-content
            className="certificate-scroll"
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
              borderRadius: '0',
              p: 0,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#e8442d',
                borderRadius: '4px',
                '&:hover': {
                  background: '#ff6b35',
                },
              },
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
              <Typography variant="h4" sx={{ color: '#e8442d', fontWeight: 900, mb: 1, letterSpacing: 1, fontFamily: 'Bai Jamjuree' }}>
                Cell Health Certificate
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#cccccc', fontStyle: 'italic', letterSpacing: 1, mb: 2, fontFamily: 'Bai Jamjuree' }}>
                Comprehensive Analysis Report
              </Typography>
              <Box sx={{
                width: '40px',
                height: '4px',
                background: 'linear-gradient(90deg, #e8442d, #ff6b35)',
                borderRadius: '2px',
                mx: 'auto',
                opacity: 0.7,
                mb: 3
              }} />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Visibility />}
                  onClick={generatePDFForViewer}
                  disabled={isGeneratingPDF}
                  sx={{
                    background: 'linear-gradient(45deg, #2d7de8, #35a3ff)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    borderRadius: '25px',
                    px: 4,
                    py: 1.5,
                    boxShadow: '0 8px 25px rgba(45, 125, 232, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(45, 125, 232, 0.6)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(45deg, #666, #888)',
                      color: '#ccc',
                    },
                  }}
                >
                  {isGeneratingPDF ? 'Generating...' : 'View PDF'}
                </Button>

                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={generatePDF}
                  disabled={isGeneratingPDF}
                  sx={{
                    background: 'linear-gradient(45deg, #e8442d, #ff6b35)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    borderRadius: '25px',
                    px: 4,
                    py: 1.5,
                    boxShadow: '0 8px 25px rgba(232, 68, 45, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(232, 68, 45, 0.6)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(45deg, #666, #888)',
                      color: '#ccc',
                    },
                  }}
                >
                  {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4 }}>
              <Paper elevation={3} sx={{
                background: 'linear-gradient(135deg, #181818, #232323)',
                border: '2px solid #e8442d',
                borderRadius: '1rem',
                p: 2,
                minWidth: 300,
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Typography variant="h6" sx={{ color: '#e8442d', mb: 2, textAlign: 'center', fontWeight: 700, fontFamily: 'Bai Jamjuree' }}>
                  Cell Images
                </Typography>

                <Box sx={{
                  width: '100%',
                  height: 250,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  position: 'relative'
                }}>
                  <IconButton
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + cellImages.length) % cellImages.length)}
                    sx={{
                      position: 'absolute',
                      left: 0,
                      color: '#e8442d',
                      zIndex: 1,
                      '&:hover': { backgroundColor: 'rgba(232, 68, 45, 0.1)' }
                    }}
                  >
                    <NavigateBefore />
                  </IconButton>

                  <Box
                    component="img"
                    src={cellImages[currentImageIndex]}
                    alt={`Cell Image ${currentImageIndex + 1}`}
                    sx={{
                      maxWidth: '80%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid rgba(232, 68, 45, 0.3)'
                    }}
                  />

                  <IconButton
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % cellImages.length)}
                    sx={{
                      position: 'absolute',
                      right: 0,
                      color: '#e8442d',
                      zIndex: 1,
                      '&:hover': { backgroundColor: 'rgba(232, 68, 45, 0.1)' }
                    }}
                  >
                    <NavigateNext />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  {cellImages.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: index === currentImageIndex ? '#e8442d' : 'rgba(232, 68, 45, 0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: index === currentImageIndex ? '#ff6b35' : 'rgba(232, 68, 45, 0.5)',
                          transform: 'scale(1.2)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Paper>

              <Paper elevation={3} sx={{
                background: 'linear-gradient(135deg, #181818, #232323)',
                border: '2px solid #e8442d',
                borderRadius: '1rem',
                p: 2,
                minWidth: 300,
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Typography variant="h6" sx={{ color: '#e8442d', mb: 2, textAlign: 'center', fontWeight: 700, fontFamily: 'Bai Jamjuree' }}>
                  Barcode
                </Typography>

                <Box sx={{
                  width: '100%',
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1
                }}>
                  <Box
                    component="img"
                    src={BarcodeImage}
                    alt="Barcode"
                    sx={{
                      width: '75%',
                      height: 'auto',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid rgba(232, 68, 45, 0.3)'
                    }}
                  />
                </Box>
              </Paper>

              <Paper elevation={3} sx={{
                background: 'linear-gradient(135deg, #181818, #232323)',
                border: '2px solid #e8442d',
                borderRadius: '1rem',
                p: 3,
                minWidth: 350,
                minHeight: 320
              }}>
                <Typography variant="h6" sx={{ color: '#e8442d', mb: 3, textAlign: 'center', fontWeight: 700, fontFamily: 'Bai Jamjuree' }}>
                  Cell Information
                </Typography>
                <Box sx={{
                  border: '1px solid rgba(232, 68, 45, 0.2)',
                  borderRadius: '0.5rem',
                  p: 2,
                  background: 'rgba(0,0,0,0.3)'
                }}>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        {fetchedCellData?.uid && (
                          <TableRow sx={{ borderBottom: '1px solid rgba(232, 68, 45, 0.2)' }}>
                            <TableCell sx={{
                              color: '#e8442d',
                              fontWeight: 700,
                              borderRight: '1px solid rgba(232, 68, 45, 0.2)',
                              pr: 2
                            }}>
                              Cell UID
                            </TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 500, pl: 2 }}>
                              {fetchedCellData.uid}
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow sx={{ borderBottom: '1px solid rgba(232, 68, 45, 0.2)' }}>
                          <TableCell sx={{
                            color: '#e8442d',
                            fontWeight: 700,
                            borderRight: '1px solid rgba(232, 68, 45, 0.2)',
                            pr: 2
                          }}>
                            Make/Model
                          </TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 500, pl: 2 }}>
                            {fetchedCellData?.makeModel || 'LG 21700'}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: '1px solid rgba(232, 68, 45, 0.2)' }}>
                          <TableCell sx={{
                            color: '#e8442d',
                            fontWeight: 700,
                            borderRight: '1px solid rgba(232, 68, 45, 0.2)',
                            pr: 2
                          }}>
                            Nominal Capacity
                          </TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 500, pl: 2 }}>
                            {fetchedCellData?.nominalCapacity || 5000} mAh
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: '1px solid rgba(232, 68, 45, 0.2)' }}>
                          <TableCell sx={{
                            color: '#e8442d',
                            fontWeight: 700,
                            borderRight: '1px solid rgba(232, 68, 45, 0.2)',
                            pr: 2
                          }}>
                            Current Capacity
                          </TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 500, pl: 2 }}>
                            {Math.round(currentCapacity)} mAh
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: '1px solid rgba(232, 68, 45, 0.2)' }}>
                          <TableCell sx={{
                            color: '#e8442d',
                            fontWeight: 700,
                            borderRight: '1px solid rgba(232, 68, 45, 0.2)',
                            pr: 2
                          }}>
                            Chemistry
                          </TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 500, pl: 2 }}>
                            {fetchedCellData?.cellChemistry || 'NMC'}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: '1px solid rgba(232, 68, 45, 0.2)' }}>
                          <TableCell sx={{
                            color: '#e8442d',
                            fontWeight: 700,
                            borderRight: '1px solid rgba(232, 68, 45, 0.2)',
                            pr: 2
                          }}>
                            Nominal Voltage
                          </TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 500, pl: 2 }}>
                            {fetchedCellData?.nominalVoltage || 3.6} V
                          </TableCell>
                        </TableRow>
                        {fetchedCellData?.ocv && (
                          <TableRow sx={{ borderBottom: '1px solid rgba(232, 68, 45, 0.2)' }}>
                            <TableCell sx={{
                              color: '#e8442d',
                              fontWeight: 700,
                              borderRight: '1px solid rgba(232, 68, 45, 0.2)',
                              pr: 2
                            }}>
                              OCV
                            </TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 500, pl: 2 }}>
                              {fetchedCellData.ocv} V
                            </TableCell>
                          </TableRow>
                        )}
                        {fetchedCellData?.ir && (
                          <TableRow sx={{ borderBottom: '1px solid rgba(232, 68, 45, 0.2)' }}>
                            <TableCell sx={{
                              color: '#e8442d',
                              fontWeight: 700,
                              borderRight: '1px solid rgba(232, 68, 45, 0.2)',
                              pr: 2
                            }}>
                              Internal Resistance
                            </TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 500, pl: 2 }}>
                              {fetchedCellData.ir} Ω
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Paper>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4 }}>
              <Paper elevation={3} sx={{ px: 5, py: 2, border: '2px solid #e8442d', borderRadius: '1.5rem', background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', minWidth: 180 }}>
                <Typography variant="h6" sx={{ color: '#e8442d', fontWeight: 900, letterSpacing: 1, fontFamily: 'Bai Jamjuree' }}>
                  SOH = {currentSOH}%
                </Typography>
              </Paper>
              <Paper elevation={3} sx={{ px: 5, py: 2, border: '2px solid #e8442d', borderRadius: '1.5rem', background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', minWidth: 180 }}>
                <Typography variant="h6" sx={{ color: '#e8442d', fontWeight: 900, letterSpacing: 1, fontFamily: 'Bai Jamjuree' }}>
                  RUL = {currentRUL} cycles
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ mb: 4, mt: 10 }}>
              <Paper elevation={3} sx={{
                background: 'black',
                border: '2px solid #e8442d',
                borderRadius: '1rem',
                p: 3,
                mb: 3
              }}>
                <Typography variant="h6" sx={{ color: '#e8442d', mb: 3, textAlign: 'center', fontWeight: 700, fontFamily: 'Bai Jamjuree' }}>
                  Cell Aging Reference Data: Capacity vs Cycles
                </Typography>
                <CapacityVsCyclePlot currentSOH={currentSOH} currentCapacity={currentCapacity} />
              </Paper>

              <Paper elevation={3} sx={{
                background: 'black',
                border: '2px solid #e8442d',
                borderRadius: '1rem',
                mt: 10,
                p: 3
              }}>
                <Typography variant="h6" sx={{ color: '#e8442d', mb: 3, textAlign: 'center', fontWeight: 700, fontFamily: 'Bai Jamjuree' }}>
                  Cell Aging Reference Data: Internal Resistance vs Cycles
                </Typography>
                <InternalResistanceVsCyclePlot currentSOH={currentSOH} currentCapacity={currentCapacity} />
              </Paper>

              <Paper elevation={3} sx={{
                background: 'black',
                border: '2px solid #e8442d',
                borderRadius: '1rem',
                mt: 10,
                p: 3
              }}>
                <Typography variant="h6" sx={{ color: '#e8442d', mb: 3, textAlign: 'center', fontWeight: 700, fontFamily: 'Bai Jamjuree' }}>
                  Cell Aging Reference Data: Combined Capacity and Resistance vs Cycles
                </Typography>
                <CombinedCapacityResistancePlot currentSOH={currentSOH} currentCapacity={currentCapacity} />
              </Paper>
            </Box>

            <Typography variant="body2" sx={{ color: '#cccccc', textAlign: 'center', mb: 0, fontFamily: 'Bai Jamjuree' }}>
              End of Certificate
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CellHealthCertificate;
