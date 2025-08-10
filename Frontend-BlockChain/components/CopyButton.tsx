import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '../constants';

interface CopyButtonProps {
  textToCopy: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-md hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
      title={copied ? 'Copied!' : 'Copy hash'}
    >
      {copied ? (
        <CheckIcon className="w-5 h-5 text-green-400" />
      ) : (
        <ClipboardIcon className="w-5 h-5 text-slate-400" />
      )}
    </button>
  );
};

export default CopyButton;