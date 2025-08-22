'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/hooks/use-toast';
import { 
  Star, 
  Check, 
  X, 
  Award, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  MessageSquare,
  Calendar,
  User,
  Car,
  TrendingUp,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface Review {
  id?: string;
  _id?: string;
  carId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  isFeatured: boolean;
  isAdminCreated: boolean;
  createdAt: string;
  car?: {
    id?: string;
    _id?: string;
    name: string;
    brand: string;
    model: string;
  };
}

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [carsLoading, setCarsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    carId: '',
    userName: '',
    userEmail: '',
    rating: 5,
    title: '',
    comment: ''
  });
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews?includeUnapproved=true');
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchCars = async () => {
    setCarsLoading(true);
    try {
      const response = await fetch('/api/cars/list');
      const data = await response.json();
      // console.log('Cars API response:', data);
      if (data.success && data.data) {
        setCars(data.data);
      } else {
        console.error('No cars data in response:', data);
        setCars([]);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      setCars([]);
    } finally {
      setCarsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchReviews(), fetchCars()]).finally(() => setLoading(false));
  }, []);

  // Debug cars data
  useEffect(() => {
    // console.log('Current cars state:', cars);
  }, [cars]);

  const handleAction = async (reviewId: string, action: 'approve' | 'reject' | 'toggleFeatured' | 'delete') => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: data.message || 'Action completed successfully',
        });
        fetchReviews();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to perform action',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform action',
        variant: 'destructive'
      });
    }
  };

  const handleCreateReview = async () => {
    if (!createForm.carId || !createForm.userName || !createForm.title || !createForm.comment) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Review created successfully',
        });
        setShowCreateDialog(false);
        setCreateForm({
          carId: '',
          userName: '',
          userEmail: '',
          rating: 5,
          title: '',
          comment: ''
        });
        fetchReviews();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create review',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create review',
        variant: 'destructive'
      });
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'approved' && review.isApproved) ||
      (filterStatus === 'pending' && !review.isApproved) ||
      (filterStatus === 'featured' && review.isFeatured);

    return matchesSearch && matchesFilter;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-400'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (isApproved: boolean, isFeatured: boolean) => {
    if (isFeatured) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (isApproved) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    return 'bg-gradient-to-r from-yellow-500 to-amber-500';
  };

  const getStatusText = (isApproved: boolean, isFeatured: boolean) => {
    if (isFeatured) return 'Featured';
    if (isApproved) return 'Approved';
    return 'Pending';
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Reviews Management
            </h1>
            <p className="text-muted-foreground">Manage and moderate customer reviews</p>
          </div>
        </div>
        
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.isApproved).length,
    pending: reviews.filter(r => !r.isApproved).length,
    featured: reviews.filter(r => r.isFeatured).length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Reviews Management
          </h1>
          <p className="text-muted-foreground">Manage and moderate customer reviews</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={fetchCars}
            variant="outline"
            disabled={carsLoading}
            className="border-border/50 hover:bg-accent/50"
          >
            {carsLoading ? 'Loading...' : 'Refresh Cars'}
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25">
                <Plus className="w-4 h-4 mr-2" />
                Create Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-sm border-border/50">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Create New Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Car *</Label>
                  <Select value={createForm.carId} onValueChange={(value) => setCreateForm(prev => ({ ...prev, carId: value }))}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder={cars.length > 0 ? "Select a car" : "Loading cars..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {cars.length > 0 ? (
                        cars.map((car) => (
                          <SelectItem key={car.id} value={car.id}>
                            {car.brand} {car.model} - {car.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          {carsLoading ? "Loading cars..." : "No cars available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {cars.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {carsLoading ? "Loading cars..." : "No cars found. Please add some cars first."}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name *</Label>
                    <Input
                      value={createForm.userName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, userName: e.target.value }))}
                      placeholder="Reviewer name"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      type="email"
                      value={createForm.userEmail}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, userEmail: e.target.value }))}
                      placeholder="Reviewer email"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Rating *</Label>
                  <Select value={createForm.rating.toString()} onValueChange={(value) => setCreateForm(prev => ({ ...prev, rating: parseInt(value) }))}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} Star{rating > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Title *</Label>
                  <Input
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Review title"
                    maxLength={100}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Comment *</Label>
                  <Textarea
                    value={createForm.comment}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Review comment"
                    maxLength={1000}
                    rows={4}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-border/50">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateReview} className="bg-gradient-to-r from-primary to-primary/80">
                    Create Review
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold text-purple-400">{stats.featured}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    
      {/* Filters */}
      <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">Search Reviews</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, title, or comment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-background/50 border-border/50 min-w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">No reviews found</p>
              <p className="text-muted-foreground/70 text-sm mt-1">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review._id || review.id} className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:from-card/70 hover:to-card/40 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                      <span className="text-white font-semibold text-lg">
                        {review.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{review.userName}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.isFeatured && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                        <Award className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {review.isAdminCreated && (
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        Admin Created
                      </Badge>
                    )}
                    <Badge className={`${getStatusColor(review.isApproved, review.isFeatured)} text-white border-0`}>
                      {getStatusText(review.isApproved, review.isFeatured)}
                    </Badge>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    {renderStars(review.rating)}
                    <h4 className="font-semibold text-lg">{review.title}</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                  {review.car && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <Car className="w-4 h-4" />
                      <span>{review.car.brand} {review.car.model} - {review.car.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {!review.isApproved && (
                    <Button
                      size="sm"
                      onClick={() => handleAction(review._id || review.id || '', 'approve')}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/25"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {!review.isApproved && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(review._id || review.id || '', 'reject')}
                      className="shadow-lg shadow-destructive/25"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(review._id || review.id || '', 'toggleFeatured')}
                    className="border-border/50 hover:bg-accent/50"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    {review.isFeatured ? 'Unfeature' : 'Feature'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
                        handleAction(review._id || review.id || '', 'delete');
                      }
                    }}
                    className="shadow-lg shadow-destructive/25"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
