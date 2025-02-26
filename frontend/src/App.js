import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [status] = useState('unsold');
  const [verificationStatus] = useState('incomplete');
  const [createdAt] = useState(new Date().toISOString());
  const [updatedAt] = useState(new Date().toISOString());
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !category || !image) {
      setErrorMessage('All fields are required');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('status', status);
    formData.append('verification_status', verificationStatus);
    formData.append('created_at', createdAt);
    formData.append('updated_at', updatedAt);
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5000/image/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Handle success (e.g., redirect or clear form)
      console.log('Product created:', response.data);
      setName('');
      setPrice('');
      setCategory('');
      setImage(null);
    } catch (error) {
      setErrorMessage('An error occurred while adding the product');
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Add Product</h1>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Category:</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Status:</label>
          <input
            type="text"
            value={status}
            readOnly
          />
        </div>

        <div>
          <label>Verification Status:</label>
          <input
            type="text"
            value={verificationStatus}
            readOnly
          />
        </div>

        <div>
          <label>Created At:</label>
          <input
            type="text"
            value={createdAt}
            readOnly
          />
        </div>

        <div>
          <label>Updated At:</label>
          <input
            type="text"
            value={updatedAt}
            readOnly
          />
        </div>

        <div>
          <label>Image:</label>
          <input
            type="file"
            onChange={handleImageChange}
            required
          />
        </div>

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}

export default App;
