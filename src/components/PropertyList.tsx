import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export default function PropertyList() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data } = await client.models.Property.list();
      console.log('Fetched properties:', data);
      
      // Fetch images for each property
      const propertiesWithImages = await Promise.all(
        data.map(async (property) => {
          const { data: images } = await client.models.PropertyImage.list({
            filter: { propertyId: { eq: property.id } },
          });
          
          console.log(`Images for property ${property.id}:`, images);
          
          return { ...property, images };
        })
      );
      
      setProperties(propertiesWithImages);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading properties...</div>;

  return (
    <div className="property-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Available Properties</h2>
        <button onClick={fetchProperties} style={{ padding: '0.5rem 1rem' }}>
          Refresh
        </button>
      </div>
      <div className="property-grid">
        {properties.map((property) => (
          <div key={property.id} className="property-card">
            {property.images?.[0] && (
              <StorageImage
                alt={property.title}
                path={property.images[0].imageKey}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
            )}
            <div className="property-info">
              <h3>{property.title}</h3>
              <p className="price">${property.price.toLocaleString()}</p>
              <p className="address">{property.address}, {property.city}, {property.state}</p>
              <div className="property-details">
                <span>{property.bedrooms} beds</span>
                <span>{property.bathrooms} baths</span>
                {property.squareFeet && <span>{property.squareFeet} sq ft</span>}
              </div>
              <p className="description">{property.description}</p>
              <span className="status">{property.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
