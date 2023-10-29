import { useRef, useState, useEffect } from 'react';
import { FiShare2, FiMail, FiFacebook, FiTwitter } from 'react-icons/fi';
import { uploadFile } from './services/api';
import toast, { Toaster } from 'react-hot-toast';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { EmailShareButton, FacebookShareButton, TwitterShareButton } from 'react-share';
import CryptoJS from 'crypto-js';

function App() {
  const [file, setFile] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    const getImage = async () => {
      if (file) {
        setEncrypting(true); 
        const reader = new FileReader();

        reader.onload = async function (event) {
          const data = event.target.result;
          const encrypted = CryptoJS.AES.encrypt(data, 'secret key').toString();

          const encryptedFile = new File([encrypted], file.name, { type: file.type });
          const formData = new FormData();
          formData.append('name', encryptedFile.name);
          formData.append('file', encryptedFile);

          toast.promise(uploadFile(formData), {
            loading: 'Uploading...',
            success: (response) => {
              setResult(response.path);
              setEncrypting(false); 
              return <b>File uploaded successfully!</b>;
            },
            error: <b>Upload failed.</b>,
          });
        };

        reader.readAsDataURL(file);
      }
    };
    getImage();
  }, [file]);

  const onUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = async () => {
    setDecrypting(true); // Set decryption status

    // Logic for downloading and decrypting the file
    if (result) {
      const response = await fetch(result);
      const data = await response.blob();

      const reader = new FileReader();

      reader.onload = function (event) {
        const decrypted = CryptoJS.AES.decrypt(event.target.result, 'secret key').toString(CryptoJS.enc.Utf8);
        const decryptedBlob = new Blob([decrypted], { type: data.type });
        const downloadLink = window.URL.createObjectURL(decryptedBlob);

        const a = document.createElement('a');
        a.href = downloadLink;
        a.download = file.name;
        a.click();
        window.URL.revokeObjectURL(downloadLink);
        setDecrypting(false); // Reset decryption status
      };

      reader.readAsText(data);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-lime-200 p-8 flex flex-col items-center justify-center rounded-md shadow-md w-full sm:w-3/4 md:w-2/4 lg:w-1/3">
        <div className="flex justify-center items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">File Sharing App!</h1>
        </div>

        <p className="text-center mb-6">Upload and share the download link.</p>

        <div className="flex justify-center space-x-4 mb-6">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            className="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={onUploadClick}
            disabled={encrypting} // Disable the button during encryption
          >
            {encrypting ? 'Encrypting...' : 'Upload'}
          </button>
        </div>

        {result && (
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <CopyToClipboard text={result} onCopy={handleCopy}>
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center">
                <FiShare2 className="w-6 h-6 mr-2" />
                <span>Copy Share Link</span>
              </button>
            </CopyToClipboard>

            {copied && <div className="text-green-600">Link copied to clipboard!</div>}

            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
              onClick={handleDownload}
              disabled={decrypting} // Disable the button during decryption
            >
              {decrypting ? 'Decrypting...' : 'Download'}
            </button>

            <div className="flex items-center mt-4">
              <EmailShareButton url={result}>
                <FiMail className="text-blue-500 text-2xl cursor-pointer mr-2" />
              </EmailShareButton>
              <FacebookShareButton url={result}>
                <FiFacebook className="text-blue-800 text-2xl cursor-pointer mr-2" />
              </FacebookShareButton>
              <TwitterShareButton url={result}>
                <FiTwitter className="text-blue-400 text-2xl cursor-pointer" />
              </TwitterShareButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
