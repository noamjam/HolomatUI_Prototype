// src/components/MarkdownPreview.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export function MarkdownPreview({ value }) {
    return (
        <div className="markdown-preview">
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
                {value}
            </ReactMarkdown>
        </div>
    );
}
