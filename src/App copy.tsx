import { useState } from 'react'
import './App.css'
import * as Resources from './utils/resources';

type BucketState = {
  altResource: Resources.Resource,
  elections: Resources.Election[],
} | {
  altResource?: never,
  elections: Resources.Election[],
};

function DefaultBucket({elections}: {elections: Resources.Election[]}) {
  return <>

  </>;
}

function Bucket({altResource, elections}: {altResource: Resources.Resource, elections: Resources.Election[]}) {
  return <>

  </>;
}

const unassigned: Bucket = {
  elections: [
    { name: 'Stephen Funk', defaultResource: Resources.fam },
    { name: 'Louisa Funk', defaultResource: Resources.fam },
    { name: 'Victoria Funk', defaultResource: Resources.fam },
  ],
};



export default function App() {
  const [buckets, setBuckets]: [buckets: BucketState[]] = useState([
    {}
  ])
  return (
    <>

    </>
  )
}