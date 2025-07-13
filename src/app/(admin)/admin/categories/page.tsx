'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Pencil, Trash2, Plus } from 'lucide-react';
import { Category } from '@/types/category';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CategoryDialog } from '@/components/admin/category-dialog';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { useToast } from '@/components/hooks/use-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ error: string; details?: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchCategories = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Check authentication only on client side
      if (isClient && typeof window !== 'undefined' && !localStorage.getItem('isAuthenticated')) {
        throw new Error('Not authenticated');
      }

      // Mock data for categories
      const mockCarTypes: Category[] = [
        { id: '1', name: 'Sedan', slug: 'sedan', type: 'car', featured: false, image: '', createdAt: '', updatedAt: '' },
        { id: '2', name: 'SUV', slug: 'suv', type: 'car', featured: false, image: '', createdAt: '', updatedAt: '' },
        { id: '3', name: 'Hatchback', slug: 'hatchback', type: 'car', featured: false, image: '', createdAt: '', updatedAt: '' },
      ];
      const mockFuelTypes: Category[] = [
        { id: '4', name: 'Petrol', slug: 'petrol', type: 'fuel', featured: false, image: '', createdAt: '', updatedAt: '' },
        { id: '5', name: 'Diesel', slug: 'diesel', type: 'fuel', featured: false, image: '', createdAt: '', updatedAt: '' },
        { id: '6', name: 'Electric', slug: 'electric', type: 'fuel', featured: false, image: '', createdAt: '', updatedAt: '' },
      ];
      const mockTags: Category[] = [
        { id: '7', name: 'New', slug: 'new', type: 'tag', featured: false, image: '', createdAt: '', updatedAt: '' },
        { id: '8', name: 'Used', slug: 'used', type: 'tag', featured: false, image: '', createdAt: '', updatedAt: '' },
        { id: '9', name: 'Certified', slug: 'certified', type: 'tag', featured: false, image: '', createdAt: '', updatedAt: '' },
      ];

      // Combine and sort by name
      const allCategories = [...mockCarTypes, ...mockFuelTypes, ...mockTags]
        .sort((a, b) => a.name.localeCompare(b.name));

      setCategories(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError({
        error: 'Failed to fetch categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchCategories();
    }
  }, [isClient]);

  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    setDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!isClient || !window.confirm('Are you sure you want to delete this category?')) return;

    try {
      // Mock delete
      setCategories(prevCategories => prevCategories.filter(c => c.id !== category.id));
      toast({
        title: 'Category deleted',
        description: `${category.name} has been deleted successfully.`,
      });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      // Mock save
      let savedCategory: Category;
      if (selectedCategory?.id) {
        // Mock update
        setCategories(prevCategories => 
          prevCategories.map(category => 
            category.id === selectedCategory.id ? { ...category, ...categoryData } : category
          )
        );
      } else {
        // Mock create
        const newCategory: Category = {
          id: `mock-id-${Date.now()}`, // Mock ID
          name: categoryData.name as string,
          slug: categoryData.slug as string,
          type: 'mockType', // Mock type
          featured: false,
          image: categoryData.image as string,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCategories(prevCategories => [...prevCategories, newCategory]);
      }

      setDialogOpen(false);
      setSelectedCategory(undefined);
      toast({
        title: selectedCategory ? 'Category Updated' : 'Category Added',
        description: `${categoryData.name} has been ${selectedCategory ? 'updated' : 'added'} successfully.`,
      });

      // Refresh the list to ensure we have the latest data
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      throw error; // Let the dialog component handle the error display
    }
  };

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6">
            <TableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6">
            <TableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <div className="flex justify-between items-center p-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-card-foreground">Categories</h2>
            <p className="text-sm text-muted-foreground">
              Manage your categories here.
            </p>
          </div>
          <Button onClick={handleAddCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        <CardContent>
          {error ? (
            <div className="flex items-center gap-2 text-destructive mb-4">
              <AlertCircle className="h-4 w-4" />
              <p>{error.error}</p>
              {error.details && (
                <p className="text-sm text-muted-foreground">{error.details}</p>
              )}
            </div>
          ) : null}

          <div className="relative">
            <div className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} className="transition-colors hover:bg-muted/50">
                      <TableCell>
                        {category.image ? (
                          <div className="relative w-12 h-12">
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">No image</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.type}</TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          category.featured 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.featured ? 'Featured' : 'Not Featured'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
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
          </div>
        </CardContent>
      </Card>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSave={handleSaveCategory}
      />
    </div>
  );
}
