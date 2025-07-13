'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Brand } from '@/types/brand'

interface CarBrandLogoProps {
  brand: string
}

export function CarBrandLogo({ brand }: CarBrandLogoProps) {
  const [brandData, setBrandData] = useState<Brand | null>(null)

  useEffect(() => {
    const fetchBrandData = async () => {
      const slug = brand.toLowerCase().replace(/\s+/g, '-')
      const data = {}; // or mock data
      if (data) {
        setBrandData(data as Brand) // Assuming data is of type Brand
      }
    }
    fetchBrandData()
  }, [brand])

  if (!brandData) {
    return null
  }

  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white">
      <Image
        src={brandData.logo}
        alt={`${brandData.name} logo`}
        width={48}
        height={48}
        className="object-cover"
      />
    </div>
  )
}
