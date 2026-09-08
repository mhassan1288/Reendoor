import type { PropertyRecord, ServiceRequest } from './types'

export const seedRequests: ServiceRequest[] = [
  {
    id: 'sr-1',
    code: 'SR-210411',
    title: 'Kitchen Pipe Broke',
    type: 'Plumbing',
    address: '1 Broadway Hemel Hempstead HP25 8BL ...',
    postTown: 'LONDON',
    postCode: 'SE',
    status: 'Open',
    priority: 'High',
    date: '14/Dec/2025',
    createdAt: '24/Dec/2025, 3d, 10:33 AM',
    description:
      'Need help with my kitchen sink. The pipes underneath have a leakage, my house is about to drown.',
  },
  {
    id: 'sr-2',
    code: 'SR-212415',
    title: 'Fuze box blew up',
    type: 'Electrical',
    address: '953 New Street Birmingham B33 1NX',
    postTown: 'BIRMINGHAM',
    postCode: 'B33',
    status: 'Quoted',
    priority: 'Medium',
    date: '14/Dec/2025',
    createdAt: '24/Dec/2025, 3d, 10:33 AM',
    description: 'The fuse box sparked and the lights went out on the first floor.',
    quoteAmount: 200,
  },
  {
    id: 'sr-3',
    code: 'SR-210418',
    title: 'Rain leaking from rooftop',
    type: 'Roofing',
    address: '953 New Street Birmingham B33 1NX',
    postTown: 'BIRMINGHAM',
    postCode: 'B33',
    status: 'Accepted',
    priority: 'Medium',
    date: '14/Dec/2025',
    createdAt: '24/Dec/2025, 3d, 10:33 AM',
    description: 'Water is coming through the ceiling after last night’s rain.',
    quoteAmount: 450,
    quoteAccepted: true,
  },
  {
    id: 'sr-4',
    code: 'SR-210420',
    title: 'Chipped paint needs painting',
    type: 'Painting',
    address: '953 New Street Birmingham B33 1NX',
    postTown: 'BIRMINGHAM',
    postCode: 'B33',
    status: 'Completed',
    priority: 'Low',
    date: '14/Dec/2025',
    createdAt: '21/Jan/2026, 3d, 10:33 AM',
    description: 'Hallway walls have chipped paint and need a fresh coat.',
  },
]

export const emptyPropertyCopy = {
  title: 'A property has not been added yet',
  body: 'In order to add your property, tap the button below to proceed',
}

export const seedProperty: PropertyRecord = {
  id: 'prop-1',
  type: 'My property',
  address: 'Hampstead High Stree, London, NW3, London, United Kingdom',
  postTown: 'LONDON',
  postCode: 'SE',
  spaces: [
    { name: 'Lounging Area', note: 'Farmer Meeting' },
    { name: 'Bedroom 1', note: 'Farmer Meeting' },
    { name: 'Guestroom', note: 'Farmer Meeting' },
    { name: 'Bathroom', note: 'Farmer Meeting' },
  ],
}

export const serviceTypes = ['Plumbing', 'Electrical', 'Roofing', 'Painting', 'Carpentry']
export const priorities: Array<'High' | 'Medium' | 'Low'> = ['High', 'Medium', 'Low']
export const statuses = ['Open', 'Quoted', 'Accepted', 'Completed'] as const
