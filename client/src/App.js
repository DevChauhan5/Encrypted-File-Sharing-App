import { useRef, useState, useEffect } from 'react';
import { FiUpload, FiDownload } from 'react-icons/fi';
import { uploadFile } from './services/api'; // Correct path to your uploadFile function
import toast, { Toaster } from 'react-hot-toast'; // Assuming you've imported useToaster from react-hot-toast

function App() {
  const [file, setFile] = useState('');
  const [result, setResult] = useState('');

  const fileInputRef = useRef();

  useEffect(() => {
    const getImage = async () => {
      if (file) {
        const data = new FormData();
        data.append('name', file.name);
        data.append('file', file);

        toast.promise(uploadFile(data), {
          loading: 'Uploading...',
          success: (response) => {
            setResult(response.path);
            return <b>File uploaded successfully!</b>;
          },
          error: <b>Upload failed.</b>,
        });
      }
    };
    getImage();
  }, [file, toast]);

  const onUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <div className="bg-lime-200 p-8 flex flex-col items-center justify-center rounded-md shadow-md w-full sm:w-3/4 md:w-2/4 lg:w-1/3">
        <div className="flex justify-center items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Simple File Sharing App!</h1>
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
          >
            <FiUpload className="w-6 h-6 mr-2" />
            Upload
          </button>
        </div>

        {result && (
          <div className="text-center mb-6">
          <button 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
          onClick={() => window.open(result, '_blank')}
          >
            <FiDownload className="w-4 h-4 mr-2" />
            <span>Download File</span>
          </button>
        </div>
        
        )}
      </div>
    </div>
  );
}

export default App;
