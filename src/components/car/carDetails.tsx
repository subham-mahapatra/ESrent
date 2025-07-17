"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingState, ErrorState } from "@/components/ui/empty-state"
import { useCar } from "@/hooks/useApi"
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
  MessageCircle,
  Rocket
} from "lucide-react"
import Image from 'next/image';

export default function CarDetails() {
  const params = useParams()
  const router = useRouter()
  const carId = params.id as string
  const [isClient, setIsClient] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Mock dates for demo - in real app, these would come from URL params or state
  const [pickupDate] = useState("Sun, Jul 13")
  const [returnDate] = useState("Tue, Jul 15")
  const [location] = useState("Dubai")

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { data: car, loading, error } = useCar(carId)

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
    const days = 2 // This would be calculated from pickup/return dates
    return car?.dailyPrice ? car.dailyPrice * days : 0
  }

  if (!isClient) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />
  }

  if (loading) {
    return <LoadingState />
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-8 text-center">
            <Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-semibold mb-4">Car Not Found</h1>
            <p className="text-gray-400 mb-6">The car you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={handleBackClick} className="gap-2">
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
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBackClick} className="gap-2 text-white hover:bg-gray-800 -ml-2">
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
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Pickup Date</p>
                <p className="text-white font-medium">{pickupDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Return Date</p>
                <p className="text-white font-medium">{returnDate}</p>
              </div>
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
              <div className="relative overflow-hidden rounded-2xl bg-gray-900">
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="text-2xl font-bold">AED {car.dailyPrice.toLocaleString()}/Day</div>
              <div className="text-gray-400">Total: AED {calculateTotal().toLocaleString()} for 2 days</div>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="space-y-8">
            {/* Car Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold">{car.name}</h1>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">{car.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">{car.transmission || "Automatic"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">{car.seater ? `${car.seater} seater` : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Engine</p>
                    <p className="text-white font-medium">{car.engine || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <Rocket className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="text-sm text-gray-400">Mileage</p>
                    <p className="text-white font-medium">{car.mileage || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <Fuel className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Fuel Type</p>
                    <p className="text-white font-medium">{car.fuel || "Petrol"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <Car className="w-6 h-6 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Type</p>
                    <p className="text-white font-medium">{car.category || "Sports"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category */}
            {/* <div>
              <Badge variant="secondary" className="bg-gray-800 text-white px-4 py-2 text-base">
                Super car
              </Badge>
            </div> */}

            {/* Tags */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {car.tags && car.tags.length > 0 ? (
                  car.tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="border-gray-700 text-gray-300">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400">No tags</span>
                )}
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="text-gray-300 leading-relaxed">{car.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Book Now Button */}
        <div className="fixed bottom-6 right-6">
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white gap-2 px-8 py-4 text-lg rounded-full shadow-lg"
            onClick={() => {
              const message = `Hi, I'm interested in renting the ${car.brand} ${car.model}`
              const whatsappNumber = "+971553553626"
              const encodedMessage = encodeURIComponent(message)
              window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank")
            }}
          >
            <MessageCircle className="w-5 h-5" />
            Book Now
          </Button>
        </div>
      </div>
    </div>
  )
}
