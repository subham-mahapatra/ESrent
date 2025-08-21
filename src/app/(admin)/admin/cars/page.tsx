'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Pencil, Trash2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Car } from '@/types/car';
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
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ error: string; details?: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | undefined>();
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
  
  const { toast } = useToast();

  const fetchCars = async (page: number = currentPage) => {
    try {
      setError(null);
      setLoading(true);
      
      // Fetch from API route with pagination
      console.log(`Fetching cars from /api/cars?page=${page}&limit=${pageSize}...`);
      const res = await fetch(`/api/cars?page=${page}&limit=${pageSize}`);
      const data = await res.json();
      console.log('Raw /api/cars response:', data);
      
      let carsArray: Car[] = [];
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

  useEffect(() => {
    fetchCars(1);
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

  const handleEditCar = (car: Car) => {
    setSelectedCar(car);
    setDialogOpen(true);
  };

  const handleDeleteCar = async (car: Car) => {
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
    } catch (error) {
      console.error('Error deleting car:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete car. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveCar = async (carData: Partial<Car>) => {
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
    <div className="container mx-auto py-10">
      <Card>
        <div className="flex justify-between items-center p-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-card-foreground">Cars</h2>
            <p className="text-sm text-muted-foreground">
              Manage your car listings here.
            </p>
          </div>
          <Button onClick={handleAddCar}>
            <Plus className="h-4 w-4 mr-2" />
            Add Car
          </Button>
        </div>

        <CardContent>
          {error ? (
            <div className="flex items-center gap-2 text-destructive mb-4">
              <AlertCircle className="h-4 w-4" />
              <p>{error.error}</p>
            </div>
          ) : null}

          <div className="relative">
            {/* Fade out current table when loading */}
            <div className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cars.map((car: Car, index: number) => (
                    <TableRow key={car.id || `car-${index}`} className="transition-colors hover:bg-muted/50">
                      <TableCell>
                        {car.images && car.images.length > 0 ? (
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
                            <span className="text-muted-foreground">No image</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{car.name}</TableCell>
                      <TableCell>
                        {car.brandId && typeof car.brandId === 'object' ? (
                          <div className="flex items-center gap-2">
                            {(car.brandId as { logo: string; name: string }).logo && (
                              <Image
                                src={(car.brandId as { logo: string; name: string }).logo}
                                alt={(car.brandId as { logo: string; name: string }).name}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            )}
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
                            <span className="text-green-500">{car.discountedPrice.toLocaleString()}</span>
                            <span className="text-gray-400 text-sm line-through">{car.originalPrice.toLocaleString()}</span>
                          </div>
                        ) : car.originalPrice ? (
                          <span>{car.originalPrice.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400">Price on request</span>
                        )}/day
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-sm ${
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
                            className="transition-colors hover:bg-primary hover:text-primary-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteCar(car)}
                            className="transition-colors hover:bg-destructive hover:text-destructive-foreground"
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

              {/* Page Size Selector */}
              {/* <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const newPageSize = parseInt(e.target.value);
                    setPageSize(newPageSize);
                    setCurrentPage(1); // Reset to first page when changing page size
                    fetchCars(1); // Fetch with new page size
                  }}
                  className="border border-input bg-background px-2 py-1 rounded-md text-sm"
                >
                  <option value={6}>6 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={48}>48 per page</option>
                </select>
              </div> */}

              {/* Pagination Buttons */}
              <div className="flex items-center gap-2">
                {/* First Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={!canGoPrevious}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={!canGoPrevious}
                  className="h-8 w-8 p-0"
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
                        className="h-8 w-8 p-0"
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
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={!canGoNext}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && cars.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No cars found</h3>
                <p className="text-sm">Get started by adding your first car.</p>
              </div>
              <Button onClick={handleAddCar}>
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
