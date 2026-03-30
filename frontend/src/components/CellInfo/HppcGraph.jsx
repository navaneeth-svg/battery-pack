import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader } from "../Loaders/loader";
import GetAppIcon from '@mui/icons-material/GetApp';

function HppcGraph({
    cellId,
    HppcCsvData,
    downloadFile,
}) {
    const [htmlContent, setHtmlContent] = useState('');
    const [htmlContent2, setHtmlContent2] = useState('');
    const [loading, setLoading] = useState(true);
    const [loading2, setLoading2] = useState(true);

    useEffect(() => {
        axios.get(`${process.env.BACKEND_URL}batteries/hppc_graph/${cellId}`)
            .then(response => {
                setHtmlContent(response.data);
                setTimeout(() => {
                    executeScript();
                    setLoading(false);
                }, 1000);
            })
            .catch(error => {
                console.error('Error fetching HTML content:', error);
            });
    }, [cellId]);

    useEffect(() => {
        axios.get(`${process.env.BACKEND_URL}batteries/hppc_graph_second/${cellId}`)
            .then(response => {
                setHtmlContent2(response.data);
                setTimeout(() => {
                    executeScript();
                    setLoading2(false);
                }, 1000);
            })
            .catch(error => {
                console.error('Error fetching HTML content:', error);
            });
    }, [cellId]);

    const executeScript = () => {
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            Array.from(script.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            newScript.appendChild(document.createTextNode(script.innerHTML));
            script.parentNode.replaceChild(newScript, script);
        });
    };

    return (
        <>
            <div className="flex flex-col border border-[#e8432d29] bg-[#111111] rounded-lg p-4 my-20 py-10 max-w-[1400px] mx-auto">
                <h1 className="text-2xl text-[white] text-center">HPPC Voltage vs Time</h1>
                {loading &&
                    <div className="flex justify-center items-center h-[300px]">
                        <Loader widget={true} />
                    </div>
                }
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                <div className='flex justify-center gap-4'>
                <a className="bg-[#d98532] text-white px-4 py-2 rounded-md cursor-pointer" onClick={() => downloadFile('cell-low-current-hppc-25c-2.csv')}>
                    Download HPPC Data <GetAppIcon />
                </a>
            </div>
            </div>
            <div className="flex flex-col border border-[#e8432d29] bg-[#111111] rounded-lg p-4 my-20 py-10 max-w-[1400px] mx-auto">
                <h1 className="text-2xl text-[white] text-center">HPPC Dual-axis plot with Current and Voltage vs Time</h1>
                {loading2 &&
                    <div className="flex justify-center items-center h-[300px]">
                        <Loader widget={true} />
                    </div>
                }
                <div dangerouslySetInnerHTML={{ __html: htmlContent2 }} />
                <div className='flex justify-center gap-4'>
                    <a className="bg-[#d98532] text-white px-4 py-2 rounded-md cursor-pointer" onClick={() => downloadFile(HppcCsvData)}>
                        Download HPPC Data <GetAppIcon />
                    </a>
                </div>
            </div>
        </>
    );
}

export default HppcGraph;
