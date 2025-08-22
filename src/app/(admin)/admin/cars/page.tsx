'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Pencil, Trash2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Car, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { Car as CarType } from '@/types/car';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CarDialog } from '@/components/admin/car-dialog';
import { StatusModal } from '@/components/admin/status-modal';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { useToast } from '@/components/hooks/use-toast';
import { useAuth } from '@/hooks/useApi';

export default function AdminCars() {
  const { token } = useAuth();
  const [cars, setCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ error: string; details?: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarType | undefined>();
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    status: 'success' | 'error';
  }>({
    open: false,
    title: '',
    description: '',
    status: 'success',
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  
  // Stats state for total data
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    featured: 0,
    unavailable: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  const { toast } = useToast();

  const fetchCars = async (page: number = currentPage) => {
    try {
      setError(null);
      setLoading(true);
      
      // Fetch from API route with pagination
      // console.log(`Fetching cars from /api/cars?page=${page}&limit=${pageSize}...`);
      const res = await fetch(`/api/cars?page=${page}&limit=${pageSize}`);
      const data = await res.json();
      // console.log('Raw /api/cars response:', data);
      
      let carsArray: CarType[] = [];
      if (data.data && Array.isArray(data.data)) {
        carsArray = data.data;
        setTotalCars(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || page);
      } else if (Array.isArray(data)) {
        carsArray = data;
        setTotalCars(carsArray.length);
        setTotalPages(1);
        setCurrentPage(1);
      } else if (data.cars && Array.isArray(data.cars)) {
        carsArray = data.cars;
        setTotalCars(data.total || carsArray.length);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || 1);
      }
      
      setCars([...carsArray]);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError({
        error: 'Failed to fetch cars',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch total stats from all cars
  const fetchTotalStats = async () => {
    try {
      setStatsLoading(true);
      const res = await fetch('/api/cars?limit=1000'); // Get all cars for stats
      const data = await res.json();
      
      let allCars: CarType[] = [];
      if (data.data && Array.isArray(data.data)) {
        allCars = data.data;
      } else if (Array.isArray(data)) {
        allCars = data;
      } else if (data.cars && Array.isArray(data.cars)) {
        allCars = data.cars;
      }

      // Calculate stats from all cars
      const total = allCars.length;
      const available = allCars.filter(car => car.available).length;
      const featured = allCars.filter(car => car.featured).length;
      const unavailable = allCars.filter(car => !car.available).length;

      setStats({
        total,
        available,
        featured,
        unavailable,
      });
    } catch (error) {
      console.error('Error fetching total stats:', error);
      // Fallback to current page data
      setStats({
        total: cars.length,
        available: cars.filter(car => car.available).length,
        featured: cars.filter(car => car.featured).length,
        unavailable: cars.filter(car => !car.available).length,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchCars(1);
  }, []);

  useEffect(() => {
    fetchTotalStats();
  }, []);

  // Pagination control functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchCars(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handleAddCar = () => {
    setSelectedCar(undefined);
    setDialogOpen(true);
  };

  const handleEditCar = (car: CarType) => {
    setSelectedCar(car);
    setDialogOpen(true);
  };

  const handleDeleteCar = async (car: CarType) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`/api/cars/${car.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      toast({
        title: 'Car deleted',
        description: `${car.name} has been deleted successfully.`,
      });
      fetchCars(currentPage);
      fetchTotalStats(); // Refresh stats after deletion
    } catch (error) {
      console.error('Error deleting car:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete car. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveCar = async (carData: Partial<CarType>) => {
    try {
      if (!token) throw new Error('Not authenticated');
      if (selectedCar) {
        const res = await fetch(`/api/cars/${selectedCar.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(carData),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.error || `HTTP error! status: ${res.status}`;
          
          // Handle specific error cases
          if (res.status === 400) {
            throw new Error(`Validation Error: ${errorMessage}`);
          } else if (res.status === 404) {
            throw new Error('Car not found. It may have been deleted by another user.');
          } else if (res.status === 401) {
            throw new Error('Authentication expired. Please log in again.');
          } else if (res.status === 403) {
            throw new Error('You do not have permission to update this car.');
          } else if (res.status === 409) {
            throw new Error('Car name already exists. Please choose a different name.');
          } else {
            throw new Error(`Update failed: ${errorMessage}`);
          }
        }
        
        const updatedCar = await res.json();
        setCars(prevCars => 
          prevCars.map(car => 
            car.id === selectedCar.id ? { ...car, ...updatedCar } : car
          )
        );
      } else {
        // Ensure carData matches CreateCarData type
        const requiredFields = ['brand', 'model', 'name', 'originalPrice', 'images', 'carTypeIds'];
        for (const field of requiredFields) {
          if (!((carData as any)[field]) || (Array.isArray((carData as any)[field]) && (carData as any)[field].length === 0)) {
            throw new Error(`Missing required field: ${field}`);
          }
        }
        
        const res = await fetch('/api/cars', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(carData),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.error || `HTTP error! status: ${res.status}`;
          
          // Handle specific error cases
          if (res.status === 400) {
            throw new Error(`Validation Error: ${errorMessage}`);
          } else if (res.status === 401) {
            throw new Error('Authentication expired. Please log in again.');
          } else if (res.status === 403) {
            throw new Error('You do not have permission to create cars.');
          } else if (res.status === 409) {
            throw new Error('Car name already exists. Please choose a different name.');
          } else if (res.status === 413) {
            throw new Error('Car data is too large. Please reduce the number of images or description length.');
          } else {
            throw new Error(`Creation failed: ${errorMessage}`);
          }
        }
        
        const createdCar = await res.json();
        setCars(prevCars => [...prevCars, createdCar]);
      }

      // Close dialog and show success message
      setDialogOpen(false);
      setSelectedCar(undefined);
      setStatusModal({
        open: true,
        title: selectedCar ? 'Car Updated' : 'Car Added',
        description: `${carData.name} has been ${selectedCar ? 'updated' : 'added'} successfully.`,
        status: 'success',
      });

      // Fetch fresh data in the background
      fetchCars(currentPage);
      fetchTotalStats(); // Refresh stats after save
    } catch (error) {
      console.error('Error saving car:', error);
      
      // Extract specific error message
      let errorMessage = 'Failed to save car. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setStatusModal({
        open: true,
        title: 'Error',
        description: errorMessage,
        status: 'error',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Cars Management
          </h1>
          <p className="text-muted-foreground">Manage your car inventory and listings</p>
        </div>
        <Button 
          onClick={handleAddCar}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Car
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cars</p>
                <p className="text-2xl font-bold text-blue-400">
                  {statsLoading ? '...' : stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-400">
                  {statsLoading ? '...' : stats.available}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold text-purple-400">
                  {statsLoading ? '...' : stats.featured}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unavailable</p>
                <p className="text-2xl font-bold text-red-400">
                  {statsLoading ? '...' : stats.unavailable}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          {error ? (
            <div className="flex items-center gap-2 text-destructive mb-6">
              <AlertCircle className="h-4 w-4" />
              <p>{error.error}</p>
            </div>
          ) : null}

          <div className="relative">
            {/* Fade out current table when loading */}
            <div className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="text-muted-foreground">Image</TableHead>
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Brand</TableHead>
                    <TableHead className="text-muted-foreground">Category</TableHead>
                    <TableHead className="text-muted-foreground">Price</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cars.map((car: CarType, index: number) => (
                    <TableRow key={car.id || `car-${index}`} className="border-border/50 hover:bg-accent/50 transition-colors">
                      <TableCell>
                        {car.images && car.images.length > 0 && car.images[0] && car.images[0].trim() !== '' ? (
                          <div className="relative w-16 h-16 rounded-md overflow-hidden">
                            <Image
                              src={car.images[0]}
                              alt={car.name}
                              fill
                              className="object-cover transition-transform hover:scale-110"
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">No image</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{car.name}</TableCell>
                      <TableCell>
                        {car.brandId && typeof car.brandId === 'object' ? (
                          <div className="flex items-center gap-2">
                            {(car.brandId as { logo: string; name: string }).logo && (car.brandId as { logo: string; name: string }).logo.trim() !== '' ? (
                              <Image
                                src={(car.brandId as { logo: string; name: string }).logo}
                                alt={(car.brandId as { logo: string; name: string }).name}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : null}
                            <span>{(car.brandId as { logo: string; name: string }).name}</span>
                          </div>
                        ) : (
                          car.brand
                        )}
                      </TableCell>
                      <TableCell>
                        {/* Show first car type name if available, else fallback */}
                        {Array.isArray(car.carTypeIds) && car.carTypeIds.length > 0
                          ? car.carTypeIds[0]
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {car.discountedPrice && car.originalPrice ? (
                          <div className="flex flex-col">
                            <span className="text-green-500 font-medium">AED {car.discountedPrice.toLocaleString()}</span>
                            <span className="text-muted-foreground text-sm line-through">AED {car.originalPrice.toLocaleString()}</span>
                          </div>
                        ) : car.originalPrice ? (
                          <span className="font-medium">AED {car.originalPrice.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">Price on request</span>
                        )}/day
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          car.available
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                            : 'bg-red-500/20 text-red-600 dark:text-red-400'
                        }`}>
                          {car.available ? 'Available' : 'Unavailable'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditCar(car)}
                            className="transition-colors hover:bg-primary hover:text-primary-foreground border-border/50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteCar(car)}
                            className="transition-colors hover:bg-destructive hover:text-destructive-foreground border-border/50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Show skeleton loader when loading */}
            <div className={`absolute inset-0 transition-opacity duration-200 ${
              loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
              <TableSkeleton />
            </div>
          </div>

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              {/* Page Info */}
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCars)} of {totalCars} cars
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-2">
                {/* First Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={!canGoPrevious}
                  className="h-8 w-8 p-0 border-border/50"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={!canGoPrevious}
                  className="h-8 w-8 p-0 border-border/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="h-8 w-8 p-0 border-border/50"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={!canGoNext}
                  className="h-8 w-8 p-0 border-border/50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={!canGoNext}
                  className="h-8 w-8 p-0 border-border/50"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && cars.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No cars found</h3>
              <p className="text-sm text-muted-foreground/70 mb-4">Get started by adding your first car.</p>
              <Button onClick={handleAddCar} className="bg-gradient-to-r from-primary to-primary/80">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Car
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CarDialog
        car={selectedCar}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveCar}
      />
      <StatusModal
        open={statusModal.open}
        onOpenChange={(open) => setStatusModal({ ...statusModal, open })}
        title={statusModal.title}
        description={statusModal.description}
        status={statusModal.status}
      />
    </div>
  );
}
