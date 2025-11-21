import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { StorageManager } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

interface CreatePropertyProps {
  onSuccess: () => void;
}

export default function CreateProperty({ onSuccess }: CreatePropertyProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    propertyType: 'HOUSE',
    status: 'AVAILABLE',
  });
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Creating property with data:', formData);
      
      // Create property
      const { data: property, errors } = await client.models.Property.create(
        {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseFloat(formData.bathrooms),
          squareFeet: formData.squareFeet ? parseInt(formData.squareFeet) : undefined,
          propertyType: formData.propertyType as any,
          status: formData.status as any,
        },
        {
          authMode: 'userPool',
        }
      );

      if (errors) {
        console.error('GraphQL errors:', errors);
        alert(`Failed to create property: ${errors.map(e => e.message).join(', ')}`);
        setLoading(false);
        return;
      }

      if (!property) {
        console.error('No property returned from create');
        alert('Failed to create property: No data returned');
        setLoading(false);
        return;
      }

      console.log('Property created:', property);

      // Create property images
      if (uploadedFiles.length > 0) {
        console.log('Creating property images:', uploadedFiles);
        const imageResults = await Promise.all(
          uploadedFiles.map((fileKey, index) =>
            client.models.PropertyImage.create(
              {
                propertyId: property.id,
                imageKey: fileKey,
                isPrimary: index === 0,
                order: index,
              },
              {
                authMode: 'userPool',
              }
            )
          )
        );
        console.log('Images created:', imageResults);
      }

      alert('Property created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating property:', error);
      alert(`Failed to create property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="create-property">
      <h2>List Your Property</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Property Type</label>
            <select name="propertyType" value={formData.propertyType} onChange={handleChange}>
              <option value="HOUSE">House</option>
              <option value="APARTMENT">Apartment</option>
              <option value="CONDO">Condo</option>
              <option value="TOWNHOUSE">Townhouse</option>
              <option value="LAND">Land</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Zip Code</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Bathrooms</label>
            <input
              type="number"
              step="0.5"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Square Feet</label>
            <input
              type="number"
              name="squareFeet"
              value={formData.squareFeet}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Property Images</label>
          <StorageManager
            acceptedFileTypes={['image/*']}
            path="public/"
            maxFileCount={10}
            isResumable
            onUploadSuccess={({ key }) => {
              console.log('File uploaded with key:', key);
              setUploadedFiles((prev) => [...prev, key!]);
            }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Property'}
        </button>
      </form>
    </div>
  );
}
