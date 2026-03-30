import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader } from "../Loaders/loader";
import GetAppIcon from '@mui/icons-material/GetApp';

function ImpedanceGraph({
    cellId,
    ImpedanceCsvData,
    downloadFile,
}) {
    const [htmlContent, setHtmlContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${process.env.BACKEND_URL}batteries/impedance_graph/${cellId}`)
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
        <div className="flex flex-col border border-[#e8432d29] bg-[#111111] rounded-lg p-4 my-20 py-10 max-w-[1400px] mx-auto">
            <h1 className="text-2xl text-[white] text-center">Electrochemical Impedance Spectroscopy Signature</h1>
            {loading &&
                <div className="flex justify-center items-center h-[300px]">
                    <Loader widget={true} />
                </div>
            }
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            <div className='flex justify-center gap-4'>
                <a className="bg-[#d98532] text-white px-4 py-2 rounded-md cursor-pointer" onClick={() => downloadFile(ImpedanceCsvData)}>
                    Download EIS Data <GetAppIcon />
                </a>
            </div>
        </div>
    );
}

export default ImpedanceGraph;
