import React, { FC, ReactNode, useState } from 'react';
import { CloseIcon } from './CloseIcon';

export const FixedAnimateScalePanel: FC<{
    children: ReactNode;
    className?: string;
    openClassName?: string;
    closeClassName?: string;
    initOpen?: boolean;
}> = ({
    children,
    className,
    openClassName,
    closeClassName,
    initOpen = false,
}) => {
    const [open, setOpen] = useState<boolean>(initOpen);
    
    const classes = [
        'fixed-panel',
        open ? 'open' : '',
        className || '',
        open ? openClassName || '' : closeClassName || ''
    ].filter(Boolean).join(' ');
    
    return (
        <div
            onClick={() => !open && setOpen(true)}
            className={classes}
        >
            {children}
            <div className="close-btn" onClick={() => setOpen(false)}>
                <CloseIcon fill={'#888'} />
            </div>
        </div>
    );
};
