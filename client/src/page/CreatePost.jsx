import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { preview } from '../assets';
import { getRandomPrompt } from '../utils';
import { FormField, Loader } from '../components';

const CreatePost = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    prompt: '',
    photo: '',
  });

  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // Handle surprise prompt generation
  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm((prevForm) => ({ ...prevForm, prompt: randomPrompt }));
  };

  // Generate image based on the provided prompt
  const generateImage = async () => {
    if (!form.prompt.trim()) {
      alert('Please provide a valid prompt.');
      return;
    }

    try {
      setGeneratingImg(true);

      const response = await fetch('https://img-gen-1gs7.onrender.com/api/v1/dalle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: form.prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to generate image.');
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.photo) {
        setForm((prevForm) => ({
          ...prevForm,
          photo: `data:image/jpeg;base64,${data.photo}`,
        }));
      } else if (data.photos && data.photos.length > 0) {
        // If the API returns multiple photos
        setForm((prevForm) => ({
          ...prevForm,
          photo: `data:image/jpeg;base64,${data.photos[0]}`, // Display the first photo
        }));
      } else {
        alert('No image generated. Please try a different prompt.');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setGeneratingImg(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!form.prompt.trim()) {
      alert('Please provide a prompt.');
      return;
    }

    if (!form.photo) {
      alert('Please generate an image before sharing.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://img-gen-1gs7.onrender.com/api/v1/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to share post.');
      }

      const result = await response.json();
      console.log('Post Shared:', result);

      alert('Post shared successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error sharing post:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto p-4">
      <div>
        <h1 className="font-extrabold text-[#222328] text-[32px]">Create</h1>
        <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">
          Generate an imaginative image through DALL-E AI and share it with the community.
        </p>
      </div>

      <form className="mt-16 max-w-3xl" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5">
          {/* Your Name Field */}
          <FormField
            labelName="Your Name"
            type="text"
            name="name"
            placeholder="Ex., John Doe"
            value={form.name}
            handleChange={handleChange}
          />

          {/* Prompt Field */}
          <FormField
            labelName="Prompt"
            type="text"
            name="prompt"
            placeholder="An Impressionist oil painting of sunflowers in a purple vase…"
            value={form.prompt}
            handleChange={handleChange}
            isSurpriseMe
            handleSurpriseMe={handleSurpriseMe}
          />

          {/* Image Display */}
          <div className="relative bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 p-3 h-64 flex justify-center items-center">
            {form.photo ? (
              <img src={form.photo} alt={form.prompt} className="w-full h-full object-contain" />
            ) : (
              <img src={preview} alt="preview" className="w-9/12 h-9/12 object-contain opacity-40" />
            )}

            {generatingImg && (
              <div className="absolute inset-0 z-10 flex justify-center items-center bg-[rgba(0,0,0,0.5)] rounded-lg">
                <Loader />
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-5 flex gap-5">
          <button
            type="button"
            onClick={generateImage}
            disabled={generatingImg}
            className={`text-white bg-green-700 font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center ${
              generatingImg ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-800'
            }`}
          >
            {generatingImg ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {/* Share Button */}
        <div className="mt-10">
          <p className="mt-2 text-[#666e75] text-[14px]">
            ** Once you have created the image you want, you can share it with others in the community. **
          </p>
          <button
            type="submit"
            disabled={loading}
            className={`mt-3 text-white bg-[#6469ff] font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#5753c9]'
            }`}
          >
            {loading ? 'Sharing...' : 'Share with the Community'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreatePost;
