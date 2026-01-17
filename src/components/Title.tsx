import React, { FC } from 'react';

export const Title: FC<{ title: string; desc?: string }> = ({
    title,
    desc,
}) => {
    return (
        <>
            <h1 className="title">
                {[...title].map((str, i) => (
                    <span
                        className="title-item"
                        style={{ animationDelay: i / 10 + 's' }}
                        key={`${i}`}
                    >
                        {str}
                    </span>
                ))}
            </h1>
            {desc && <h2 className="description">{desc}</h2>}
        </>
    );
};
