"use client";

import { Availability } from '@prisma/client';
import { useEffect, useState } from 'react';

const fetchAvailabilities = async () => {
  const availabilities: Availability[] = [];

  const res = await fetch('/api/availability');
  const data = await res.json();
  availabilities.push(...data.availabilities);

  return availabilities;
}

const ShiftManagerPage = () => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);

  useEffect(() => {
    fetchAvailabilities().then(setAvailabilities);
  }, []);

  return (
    <div>Shift Manager</div>
  )
}

export default ShiftManagerPage