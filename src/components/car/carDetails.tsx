"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { format, differenceInCalendarDays, parseISO } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useCar, useCategories, useBrand } from "@/hooks/useApi"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Zap,
  Fuel,
  Settings,
  Car,
  Users,
  Tag,
  Rocket,
  Hexagon
} from "lucide-react"
import Image from "next/image"
import { FaWhatsapp } from "react-icons/fa"

interface CarDetailsInterface {
  images: string[]
  available: boolean
  name: string
  dailyPrice: number
  year: number
  transmission?: string
  seater?: number
  engine?: string
  mileage?: string
  fuel?: string
  category?: string
  tags?: string[]
  description?: string
  brand?: string
  model?: string
  carTypeIds?: string[]
  transmissionIds?: string[]
  fuelTypeIds?: string[]
  tagIds?: string[]
}

export default function CarDetails() {
  const params = useParams()
  const router = useRouter()
  const carId = params.id as string
  const [isClient, setIsClient] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Date pickers state
  const today = format(new Date(), "yyyy-MM-dd")
  const tomorrow = format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd")
  const [pickupDate, setPickupDate] = useState(today)
  const [returnDate, setReturnDate] = useState(tomorrow)
  const [location] = useState("Dubai")

  useEffect(() => {
    setIsClient(true)
  }, [])

  const {
    data: car,
    loading,
    error,
  } = useCar(carId) as { data: CarDetailsInterface | null; loading: boolean; error: any }

  const { data: brandData } = useBrand((car as any)?.brandId || "")
  const { data: categoriesData, loading: categoriesLoading } = useCategories()
  const categories = categoriesData?.data || []

  // Build lookup maps
  const carTypeMap = categories
    .filter((c: any) => c.type === "carType")
    .reduce((acc: any, c: any) => {
      if (c.id) acc[c.id] = c.name
      return acc
    }, {})

  const transmissionMap = categories
    .filter((c: any) => c.type === "transmission")
    .reduce((acc: any, c: any) => {
      if (c.id) acc[c.id] = c.name
      return acc
    }, {})

  const fuelTypeMap = categories
    .filter((c: any) => c.type === "fuelType")
    .reduce((acc: any, c: any) => {
      if (c.id) acc[c.id] = c.name
      return acc
    }, {})

  const tagMap = categories
    .filter((c: any) => c.type === "tag")
    .reduce((acc: any, c: any) => {
      if (c.id) acc[c.id] = c.name
      return acc
    }, {})

  // Map car fields to names
  const carTypeNames = (car?.carTypeIds || []).map((id: string) => carTypeMap[id]).filter(Boolean)
  const transmissionNames = (car?.transmissionIds || []).map((id: string) => transmissionMap[id]).filter(Boolean)
  const fuelTypeNames = (car?.fuelTypeIds || []).map((id: string) => fuelTypeMap[id]).filter(Boolean)
  const tagNames = (car?.tagIds || []).map((id: string) => tagMap[id]).filter(Boolean)

  const handleBackClick = () => {
    if (!isClient) return
    const storedPreviousPage = localStorage.getItem("previousPage")
    localStorage.removeItem("previousPage")
    if (storedPreviousPage === "brand") {
      router.back()
    } else {
      router.push("/cars")
    }
  }

  const nextImage = () => {
    if (car?.images && car.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % car.images.length)
    }
  }

  const prevImage = () => {
    if (car?.images && car.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length)
    }
  }

  const calculateTotal = () => {
    if (!pickupDate || !returnDate || !car?.dailyPrice) return 0
    const start = parseISO(pickupDate)
    const end = parseISO(returnDate)
    let days = differenceInCalendarDays(end, start)
    if (isNaN(days) || days < 1) days = 1
    return car.dailyPrice * days
  }

  const getDayCount = () => {
    if (!pickupDate || !returnDate) return 1
    const start = parseISO(pickupDate)
    const end = parseISO(returnDate)
    let days = differenceInCalendarDays(end, start)
    if (isNaN(days) || days < 1) days = 1
    return days
  }

  const handlePickupDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPickupDate = e.target.value
    setPickupDate(newPickupDate)

    // If return date is before or same as pickup date, set it to next day
    if (returnDate <= newPickupDate) {
      const nextDay = new Date(newPickupDate)
      nextDay.setDate(nextDay.getDate() + 1)
      setReturnDate(format(nextDay, "yyyy-MM-dd"))
    }
  }

  const handleReturnDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReturnDate(e.target.value)
  }

  if (!isClient) {
    return <CarDetailsSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-800/50 border-gray-700 shadow-2xl backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-semibold mb-4 text-white">Error Loading Car</h1>
            <p className="text-gray-300 mb-6">Something went wrong while loading the car details.</p>
            <Button onClick={() => window.location.reload()} className="gap-2 bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading || categoriesLoading) {
    return <CarDetailsSkeleton />
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-800/50 border-gray-700 shadow-2xl backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-semibold mb-4 text-white">Car Not Found</h1>
            <p className="text-gray-300 mb-6">The car you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={handleBackClick} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900/80 border-b border-gray-700 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBackClick}
              className="gap-2 text-gray-400 hover:text-white hover:bg-gray-800/50 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-gray-900/40 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-8 w-full">
            {/* Pickup Date Picker */}
            <div className="flex-1 min-w-0">
              <label
                htmlFor="pickup-date"
                className="relative block"
                onClick={e => {
                  if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                    e.preventDefault();
                    const dateInput = document.getElementById('pickup-date') as HTMLInputElement;
                    if (dateInput) dateInput.showPicker();
                  }
                }}
              >
                <div className="flex items-center gap-3 p-4 bg-gray-800/70 rounded-xl border border-gray-700 shadow-sm backdrop-blur-sm cursor-pointer hover:bg-gray-800/90 transition-colors">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#44CAAD]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400">Pickup Date</p>
                    <span className="text-white font-medium truncate block">
                      {pickupDate ? format(parseISO(pickupDate), "EEE, MMM d") : "Select date"}
                    </span>
                  </div>
                  <input
                    id="pickup-date"
                    type="date"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full touch-manipulation bg-black text-white"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    value={pickupDate}
                    min={today}
                    max={returnDate}
                    onChange={handlePickupDateChange}
                    aria-label="Pickup date"
                  />
                </div>
              </label>
            </div>
            {/* Return Date Picker */}
            <div className="flex-1 min-w-0">
              <label
                htmlFor="return-date"
                className="relative block"
                onClick={e => {
                  if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                    e.preventDefault();
                    const dateInput = document.getElementById('return-date') as HTMLInputElement;
                    if (dateInput) dateInput.showPicker();
                  }
                }}
              >
                <div className="flex items-center gap-3 p-4 bg-gray-800/70 rounded-xl border border-gray-700 shadow-sm backdrop-blur-sm cursor-pointer hover:bg-gray-800/90 transition-colors">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#44CAAD]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400">Return Date</p>
                    <span className="text-white font-medium truncate block">
                      {returnDate ? format(parseISO(returnDate), "EEE, MMM d") : "Select date"}
                    </span>
                  </div>
                  <input
                    id="return-date"
                    type="date"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full touch-manipulation bg-black text-white"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    value={returnDate}
                    min={pickupDate}
                    onChange={handleReturnDateChange}
                    aria-label="Return date"
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Image */}
          <div className="space-y-6">
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl bg-gray-900 shadow-2xl border border-gray-700">
                <Image
                  src={car.images?.[currentImageIndex] || "/placeholder.svg?height=500&width=700"}
                  alt={car.name}
                  width={700}
                  height={500}
                  className="w-full h-[500px] object-cover"
                  priority
                />
                {/* Image Navigation */}
                {car.images && car.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-gray-600"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-gray-600"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="space-y-8">
            {/* Car Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-white overflow-hidden">
                  {brandData && Array.isArray(brandData.data) && brandData.data[0]?.logo ? (
                    <Image
                    src={brandData.data.find(brand => brand.id === (car as any).brandId)?.logo}
                    alt={brandData.data.find(brand => brand.id === (car as any).brandId)?.name || "Brand Logo"}
                      width={48}
                      height={48}
                      className="object-contain w-12 h-12"
                    />
                  ) : (
                    <Car className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <h1 className="text-4xl font-bold text-white">{car.name}</h1>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#44CAAD]/20 rounded-full flex items-center justify-center">
                    <Hexagon className="w-4 h-4 text-[#44CAAD]" />
                  </div>
                  <span className="text-gray-300">{car.brand}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#44CAAD]/20 rounded-full flex items-center justify-center">
                    <Settings className="w-4 h-4 text-[#44CAAD]" />
                  </div>
                  {car.available ? (
                      <span className="text-gray-300">Available</span>
                  ) : (
                    <span className="text-gray-300">Not Available</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#44CAAD]/20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#44CAAD]" />
                  </div>
                  <span className="text-gray-300">{car.seater ? `${car.seater} seater` : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
                  <div className="w-10 h-10 bg-yellow-600/20 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Model</p>
                    <p className="text-white font-medium">{car.model || "N/A"}</p>
                  </div>
                </div>
                {/* <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
                  <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Mileage</p>
                    <p className="text-white font-medium">{car.mileage || "N/A"}</p>
                  </div>
                </div> */}
                {/* <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
                  <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                    <Fuel className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Seater</p>
                    <p className="text-white font-medium">{car.seater || "N/A"}</p>
                  </div>
                </div> */}
                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                    <Car className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Type</p>
                    <p className="text-white font-medium">{carTypeNames[0] || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                <Tag className="w-5 h-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tagNames.length > 0 ? (
                  tagNames.map((tag: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="border-gray-600 text-gray-300 bg-gray-700/30 hover:bg-gray-700/50"
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400">No tags</span>
                )}
              </div>
            </div>
          </div>
        </div> {/* end grid */}

        {/* Description at the bottom, full width */}
        {car.description && (
          <div className="mt-12 w-full max-w-7xl mx-auto px-4">
            <h3 className="text-2xl font-semibold text-white mb-3">Description</h3>
            <p className="text-gray-300 leading-relaxed text-lg rounded-xl p-6 border border-gray-700 shadow-md">
              {car.description}
            </p>
          </div>
        )}
      </div>

      {/* Floating Bar at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t border-gray-800 shadow-2xl px-4 sm:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 w-full">
          <span className="text-lg sm:text-2xl font-bold text-white">AED {car.dailyPrice.toLocaleString()}/Day</span>
          <span className="text-sm sm:text-base text-gray-400">
            Total: AED {calculateTotal().toLocaleString()} for {getDayCount()} day{getDayCount() > 1 ? "s" : ""}
          </span>
        </div>
        <Button
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white gap-2 px-8 py-4 text-lg rounded-full shadow-xl border border-green-500/20 backdrop-blur-sm w-full sm:w-auto"
          onClick={() => {
            const whatsappNumber = "+971553553626"
            const dayCount = getDayCount();
            const pickup = pickupDate ? format(parseISO(pickupDate), "EEE, MMM d, yyyy") : "-";
            const dropoff = returnDate ? format(parseISO(returnDate), "EEE, MMM d, yyyy") : "-";
            const details = [
              `Car: ${car.brand || ''} ${car.model || ''} (${car.year || ''})`,
              `Name: ${car.name || ''}`,
              car.transmission ? `Transmission: ${car.transmission}` : '',
              car.seater ? `Seater: ${car.seater}` : '',
              car.engine ? `Engine: ${car.engine}` : '',
              car.mileage ? `Mileage: ${car.mileage}` : '',
              fuelTypeNames && fuelTypeNames.length ? `Fuel Type: ${fuelTypeNames[0]}` : '',
              '',
              `Pickup Date: ${pickup}`,
              `Return Date: ${dropoff}`,
              `Total Days: ${dayCount}`,
              '',
              `Total Price: AED ${calculateTotal().toLocaleString()}`
            ].filter(Boolean).join("\n");
            const message = `Hi, I'm interested in renting this car.\n\n${details}`;
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
          }}
        >
          <FaWhatsapp className="w-5 h-5" />
          Book Now
        </Button>
      </div>
    </div>
  )
}

function CarDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Skeleton */}
      <div className="bg-gray-900/80 border-b border-gray-700 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-20 bg-gray-700/50" />
            <Skeleton className="h-6 w-24 bg-gray-700/50" />
          </div>
        </div>
      </div>

      {/* Date Selection Skeleton */}
      <div className="bg-gray-900/40 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md">
            <Skeleton className="h-20 w-full bg-gray-700/50 rounded-xl" />
            <Skeleton className="h-20 w-full bg-gray-700/50 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-[500px] w-full bg-gray-700/50 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-gray-700/50" />
              <Skeleton className="h-6 w-64 bg-gray-700/50" />
            </div>
          </div>

          {/* Right Side Skeleton */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 bg-gray-700/50 rounded-full" />
                <Skeleton className="h-10 w-64 bg-gray-700/50" />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <Skeleton className="h-8 w-20 bg-gray-700/50" />
                <Skeleton className="h-8 w-20 bg-gray-700/50" />
                <Skeleton className="h-8 w-20 bg-gray-700/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full bg-gray-700/50 rounded-xl" />
              <Skeleton className="h-20 w-full bg-gray-700/50 rounded-xl" />
              <Skeleton className="h-20 w-full bg-gray-700/50 rounded-xl" />
              <Skeleton className="h-20 w-full bg-gray-700/50 rounded-xl" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-24 bg-gray-700/50" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-16 bg-gray-700/50 rounded" />
                <Skeleton className="h-8 w-20 bg-gray-700/50 rounded" />
                <Skeleton className="h-8 w-18 bg-gray-700/50 rounded" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-32 bg-gray-700/50" />
              <Skeleton className="h-20 w-full bg-gray-700/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
