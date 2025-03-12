import { NhostClient } from '@nhost/react';

// For debugging
console.log('Environment values:', {
  subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN,
  region: process.env.REACT_APP_NHOST_REGION
});

const nhost = new NhostClient({
  subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN || 'ktnqyxenwhwxuvsebdvr',
  region: process.env.REACT_APP_NHOST_REGION || 'ap-south-1'
});

export default nhost;