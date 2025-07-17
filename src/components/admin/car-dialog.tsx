'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Car } from '@/types/car';
import { Brand } from '@/types/brand';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { uploadImage } from '@/lib/cloudinary';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useBrands, useCategories } from '@/hooks/useApi';
import { Category } from '@/types/category';

interface CarDialogProps {
  car?: Car;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (car: Partial<Car>) => Promise<void>;
}

const defaultCar: Partial<Car> = {
  name: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  mileage: 0,
  dailyPrice: 0,
  images: [],
  description: '',
  features: [],
  available: true,
  featured: false,
};

export function CarDialog({ car, open, onOpenChange, onSave }: CarDialogProps) {
  const [formData, setFormData] = useState<Partial<Car>>(car || defaultCar);
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>(car?.images || []);
  const [tagsInput, setTagsInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset form data and preview images when car prop changes
    setFormData(car || defaultCar);
    setPreviewImages(car?.images || []);
    setTagsInput(car?.tags ? car.tags.join(', ') : '');
  }, [car]);

  // --- Brand API integration ---
  const { data: brands, loading: brandsLoading, error: brandsError } = useBrands({ limit: 100 });
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useCategories({ limit: 100 });
  
  // Handle both response structures: { data: [...] } and { categories: [...] }
  const categoriesArray: Category[] = useMemo(() => {
    if (categories && typeof categories === 'object') {
      if (Array.isArray((categories as { data?: unknown }).data)) {
        return ((categories as { data: unknown }).data as unknown as Category[]);
      }
      if (Array.isArray(((categories as unknown) as { categories?: unknown }).categories)) {
        return ((categories as unknown) as { categories: Category[] }).categories;
      }
    }
    return [];
  }, [categories]);
  const carTypeCategories: Category[] = categoriesArray.filter((cat) => cat.type === 'carType');
  const fuelTypeCategories: Category[] = categoriesArray.filter((cat) => cat.type === 'fuelType');
  const transmissionCategories: Category[] = categoriesArray.filter((cat) => cat.type === 'transmission');
  const tagCategories: Category[] = categoriesArray.filter((cat) => cat.type === 'tag');
  
  useEffect(() => {
    if (categories) {
      console.log('Fetched categories:', categories);
      console.log('Categories array:', categoriesArray);
      console.log('Car type categories:', carTypeCategories);
      console.log('Fuel type categories:', fuelTypeCategories);
    }
  }, [categories, categoriesArray, carTypeCategories, fuelTypeCategories]);


  useEffect(() => {
    // setBrands([]); // or mock data
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Create temporary preview URLs
      const newPreviewUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setPreviewImages([...previewImages, ...newPreviewUrls]);

      // Upload images to backend with Authorization header
      const tempId = car?.id || 'temp-' + Date.now(); // Use existing car ID or generate temp ID
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const uploadedUrls = await Promise.all(
        Array.from(files).map(file => uploadImage(file, tempId, token || undefined))
      );

      // Update form data with new image URLs
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls]
      }));

      // Clean up temporary preview URLs
      newPreviewUrls.forEach(URL.revokeObjectURL);
    } catch (error) {
      console.error('Error uploading images:', error);
      // Handle error (show toast notification, etc.)
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name?.trim()) {
      alert('Name is required');
      return;
    }
    if (!formData.brand?.trim()) {
      alert('Brand is required');
      return;
    }
    if (!formData.model?.trim()) {
      alert('Model is required');
      return;
    }
    if (!formData.year || formData.year < 1900) {
      alert('Valid year is required');
      return;
    }
    if (!formData.mileage || formData.mileage <= 0) {
      alert('Valid mileage is required');
      return;
    }
    if (!formData.dailyPrice || formData.dailyPrice <= 0) {
      alert('Valid daily price is required');
      return;
    }
    if (!formData.carTypeIds || formData.carTypeIds.length === 0) {
      alert('Car type is required');
      return;
    }
    if (!formData.fuelTypeIds || formData.fuelTypeIds.length === 0) {
      alert('Fuel type is required');
      return;
    }
    if (!formData.transmissionIds || formData.transmissionIds.length === 0) {
      alert('Transmission is required');
      return;
    }
    
    // Ensure tags are synced before submit
    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
    // Map frontend Car interface to server expected format
    const carData = {
      // Required fields for server
      name: formData.name?.trim() || '',
      brand: formData.brand?.trim() || '',
      brandId: formData.brandId,
      model: formData.model?.trim() || formData.name?.trim() || '',
      year: formData.year || new Date().getFullYear(),
      dailyPrice: formData.dailyPrice || 0,
      mileage: formData.mileage || 0,
      images: formData.images || [],
      description: formData.description || '',
      features: formData.features || [],
      available: formData.available ?? true,
      featured: formData.featured ?? false,
      engine: formData.engine,
      power: formData.power,
      seater: formData.seater,
      carTypeIds: formData.carTypeIds || [],
      transmissionIds: formData.transmissionIds || [],
      fuelTypeIds: formData.fuelTypeIds || [],
      tagIds: formData.tagIds || [],
    };
    
    await onSave(carData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">{car ? 'Edit Car' : 'Add New Car'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the car details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-card-foreground">Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand" className="text-card-foreground">Brand *</Label>
                <Select
                  value={formData.brandId || ''}
                  onValueChange={(value) => {
                    const selectedBrand = (brands?.data as unknown as Brand[])?.find((b: Brand) => b.id === value);
                    setFormData({
                      ...formData,
                      brand: selectedBrand?.name || '',
                      brandId: selectedBrand?.id || ''
                    });
                  }}
                  disabled={brandsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={brandsLoading ? 'Loading brands...' : 'Select brand'} />
                  </SelectTrigger>
                  <SelectContent>
                    {brandsError && (
                      <div className="px-2 py-1 text-red-500 text-sm">Failed to load brands</div>
                    )}
                    {brands?.data && Array.isArray(brands.data) && brands.data.length > 0 ? (
                      (brands.data as unknown as Brand[]).map((brand: Brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))
                    ) : !brandsLoading && !brandsError ? (
                      <div className="px-2 py-1 text-muted-foreground text-sm">No brands found</div>
                    ) : null}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year" className="text-card-foreground">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" className="text-card-foreground">Model</Label>
                <Input
                  id="model"
                  value={formData.model || ''}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage" className="text-card-foreground">Mileage *</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage || ''}
                  onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engine" className="text-card-foreground">Engine</Label>
                <Input
                  id="engine"
                  value={formData.engine || ''}
                  onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="power" className="text-card-foreground">Power</Label>
                <Input
                  id="power"
                  value={formData.power || ''}
                  onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seater" className="text-card-foreground">Seater</Label>
                <Input
                  id="seater"
                  type="number"
                  min={1}
                  value={formData.seater || ''}
                  onChange={(e) => setFormData({ ...formData, seater: parseInt(e.target.value) || undefined })}
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Technical Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Car Types dropdown single-select */}
              <div className="space-y-2">
                <Label className="text-card-foreground">Car Type</Label>
                <Select
                  value={formData.carTypeIds?.[0] || ''}
                  onValueChange={(value) => setFormData({ ...formData, carTypeIds: [value] })}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? 'Loading car types...' : 'Select car type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {carTypeCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id || ''}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transmission dropdown single-select */}
              <div className="space-y-2">
                <Label className="text-card-foreground">Transmission</Label>
                <Select
                  value={formData.transmissionIds?.[0] || ''}
                  onValueChange={(value) => setFormData({ ...formData, transmissionIds: [value] })}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? 'Loading transmissions...' : 'Select transmission'} />
                  </SelectTrigger>
                  <SelectContent>
                    {transmissionCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id || ''}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fuel Types dropdown single-select */}
              <div className="space-y-2">
                <Label className="text-card-foreground">Fuel Type</Label>
                <Select
                  value={formData.fuelTypeIds?.[0] || ''}
                  onValueChange={(value) => setFormData({ ...formData, fuelTypeIds: [value] })}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? 'Loading fuel types...' : 'Select fuel type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelTypeCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id || ''}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags remains as checkbox-based multi-select */}
              <div className="space-y-2">
                <Label className="text-card-foreground">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {tagCategories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={!!cat.id && (formData.tagIds || []).includes(cat.id as string)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (!cat.id) return;
                          setFormData((prev) => ({
                            ...prev,
                            tagIds: checked
                              ? [...((prev.tagIds || []).filter((id): id is string => !!id)), cat.id as string]
                              : (prev.tagIds || []).filter((id): id is string => !!id && id !== cat.id),
                          }));
                        }}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing and Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Pricing and Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyPrice" className="text-card-foreground">Daily Price *</Label>
                <Input
                  id="dailyPrice"
                  type="number"
                  value={formData.dailyPrice || ''}
                  onChange={(e) => setFormData({ ...formData, dailyPrice: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Features and Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Features and Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isAvailable"
                  checked={formData.available ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="isAvailable" className="text-card-foreground">Available for Rent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.featured ?? false}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="isFeatured" className="text-card-foreground">Featured</Label>
              </div>
            </div>
            

          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Images</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Add Images
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </div>
              
              {/* Image Preview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {previewImages.map((url, index) => (
                  <div key={url} className="relative group aspect-video">
                    <Image
                      src={url}
                      alt={`Car image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Description</h3>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-card-foreground">Car Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-32"
              />
            </div>
          </div>



          <DialogFooter>
            <Button type="submit">Save Car</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
