import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Property: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
      price: a.float().required(),
      address: a.string().required(),
      city: a.string().required(),
      state: a.string().required(),
      zipCode: a.string().required(),
      bedrooms: a.integer().required(),
      bathrooms: a.float().required(),
      squareFeet: a.integer(),
      propertyType: a.enum(['HOUSE', 'APARTMENT', 'CONDO', 'TOWNHOUSE', 'LAND']),
      status: a.enum(['AVAILABLE', 'PENDING', 'SOLD', 'RENTED']),
      images: a.hasMany('PropertyImage', 'propertyId'),
      features: a.hasMany('PropertyFeature', 'propertyId'),
    })
    .authorization(allow => [
      allow.owner().to(['read', 'create', 'update', 'delete']),
      allow.authenticated().to(['read']),
      allow.guest().to(['read']),
    ]),

  PropertyImage: a
    .model({
      propertyId: a.id().required(),
      property: a.belongsTo('Property', 'propertyId'),
      imageKey: a.string().required(),
      caption: a.string(),
      isPrimary: a.boolean(),
      order: a.integer(),
    })
    .authorization(allow => [
      allow.owner().to(['read', 'create', 'update', 'delete']),
      allow.authenticated().to(['read']),
      allow.guest().to(['read']),
    ]),

  PropertyFeature: a
    .model({
      propertyId: a.id().required(),
      property: a.belongsTo('Property', 'propertyId'),
      feature: a.string().required(),
      category: a.enum(['INTERIOR', 'EXTERIOR', 'AMENITY', 'UTILITY']),
    })
    .authorization(allow => [
      allow.owner().to(['read', 'create', 'update', 'delete']),
      allow.authenticated().to(['read']),
      allow.guest().to(['read']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
