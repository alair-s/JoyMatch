import React, { FC, MouseEventHandler, useState } from 'react';

const WxQrCode: FC<{ title?: string; onClick?: MouseEventHandler }> = ({
    title = '如果您喜欢这个项目的话，点击扫描下方收款码请我喝杯咖啡，感谢~😘',
    onClick,
}) => {
    const [fullScreen, setFullScreen] = useState<Record<number, boolean>>({
        0: false,
        1: false,
        2: false,
    });
    const onImageClick = (idx: number) => {
        setFullScreen({
            0: false,
            1: false,
            2: false,
            [idx]: !fullScreen[idx],
        });
        const clickListener: EventListener = (e) => {
            // @ts-ignore
            if (e.target?.className !== 'wx-qrcode-item-image') {
                setFullScreen({ 0: false, 1: false, 2: false });
            }
            window.removeEventListener('click', clickListener);
        };
        setTimeout(() => {
            window.addEventListener('click', clickListener);
        });
    };
    return (
        <div className="wx-qrcode-container" onClick={onClick}>
            <div className="wx-qrcode-title">{title}</div>
            {[1, 5, 8].map((num, idx) => (
                <div
                    key={num}
                    className={`wx-qrcode-item ${fullScreen[idx] ? 'fullscreen' : ''}`}
                >
                    <span className="wx-qrcode-item-title">￥ {num}</span>
                    <img
                        alt={''}
                        src={`/wxQrcode${num}.jpg`}
                        className="wx-qrcode-item-image"
                        onClick={() => onImageClick(idx)}
                    />
                </div>
            ))}
        </div>
    );
};

export default WxQrCode;
