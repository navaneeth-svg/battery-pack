import React from "react";

const CellImageCard = ({
    key,
    cellImage
}) => {
    return (
        <div
            className="bg-white w-[350px] rounded-lg overflow-hidden cursor-pointer shadow-[0px_0px_11px_0px_#e8442d]"
            key={key}
        >
            <div className="p-4">
                <div className="text-[#e8442d] mb-2 text-center">
                    Cell Image:
                </div>
                <div className="mb-2 flex flex-row justify-center items-center w-[100%]">
                    <img
                        src={`${process.env.BACKEND_URL}files/${cellImage}`}
                        alt="cellImage"
                        className="w-[75%]"
                    />
                </div>
            </div>
        </div>
    );
};

export default CellImageCard;
