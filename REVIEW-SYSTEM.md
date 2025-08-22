# Review System Documentation

## Overview

The review system for ESrent.ae allows customers to submit reviews for cars, with admin approval and featured review capabilities. The system includes both public-facing components and admin management tools.

## Features

### Public Features
- **Review Submission**: Customers can submit reviews with ratings, titles, and comments
- **Review Display**: Public display of approved reviews with ratings and statistics
- **Featured Reviews**: Highlighted reviews that appear first
- **Review Statistics**: Average ratings and rating distribution
- **Star Rating System**: 1-5 star rating with visual display

### Admin Features
- **Review Management**: View all reviews (approved and pending)
- **Approval System**: Approve or reject submitted reviews
- **Featured Reviews**: Mark reviews as featured to highlight them
- **Manual Review Creation**: Create reviews manually for any car
- **Search and Filter**: Search reviews and filter by status
- **Bulk Operations**: Manage multiple reviews efficiently

## Database Schema

### Review Model (`src/lib/models/reviewSchema.ts`)

```typescript
interface IReview {
  carId: string;           // Reference to car
  userId?: string;         // Optional user reference
  userName: string;        // Reviewer name
  userEmail?: string;      // Optional email
  rating: number;          // 1-5 star rating
  title: string;           // Review title
  comment: string;         // Review content
  isApproved: boolean;     // Approval status
  isFeatured: boolean;     // Featured status
  isAdminCreated: boolean; // Admin-created flag
  createdAt: Date;         // Creation timestamp
  updatedAt: Date;         // Update timestamp
}
```

## API Endpoints

### Public Endpoints

#### `GET /api/reviews?carId={carId}`
- **Purpose**: Get approved reviews for a specific car
- **Parameters**: 
  - `carId` (required): Car ID
  - `includeUnapproved` (optional): Include unapproved reviews (admin only)
- **Response**: Array of review objects

#### `POST /api/reviews`
- **Purpose**: Submit a new review
- **Body**: Review data (carId, userName, rating, title, comment, userEmail)
- **Response**: Created review object

#### `GET /api/reviews/stats/{carId}`
- **Purpose**: Get review statistics for a car
- **Response**: Statistics object with average rating, total reviews, and rating distribution

### Admin Endpoints

#### `GET /api/reviews?includeUnapproved=true`
- **Purpose**: Get all reviews (including unapproved)
- **Response**: Array of all review objects

#### `PATCH /api/reviews/{id}`
- **Purpose**: Update review status
- **Actions**: 
  - `approve`: Approve a review
  - `reject`: Reject and delete a review
  - `toggleFeatured`: Toggle featured status
- **Body**: `{ action: string }`

#### `PUT /api/reviews/{id}`
- **Purpose**: Update review content
- **Body**: Updated review data

#### `DELETE /api/reviews/{id}`
- **Purpose**: Delete a review
- **Response**: Success message

## Components

### Public Components

#### `ReviewSection` (`src/components/car/ReviewSection.tsx`)
- Main container component for the review section
- Combines review display and form
- Handles state management for form visibility

#### `ReviewForm` (`src/components/car/ReviewForm.tsx`)
- Form for submitting new reviews
- Includes star rating, title, and comment fields
- Form validation and submission handling

#### `ReviewDisplay` (`src/components/car/ReviewDisplay.tsx`)
- Displays approved reviews
- Shows review statistics and rating distribution
- Handles pagination and featured review highlighting

### Admin Components

#### `ReviewsPage` (`src/app/(admin)/admin/reviews/page.tsx`)
- Complete admin interface for review management
- Search and filter functionality
- Review approval and management tools
- Manual review creation dialog

## Usage

### For Customers

1. **Viewing Reviews**:
   - Navigate to any car detail page
   - Scroll down to the "Reviews" section
   - View approved reviews, ratings, and statistics

2. **Submitting Reviews**:
   - Click "Write a Review" button
   - Fill in the form with your experience
   - Submit the review (will be pending approval)

### For Admins

1. **Accessing Review Management**:
   - Log in to admin panel
   - Navigate to "Reviews" in the sidebar

2. **Managing Reviews**:
   - View all reviews (approved and pending)
   - Use search and filter to find specific reviews
   - Approve or reject pending reviews
   - Mark reviews as featured

3. **Creating Manual Reviews**:
   - Click "Create Review" button
   - Select a car and fill in review details
   - Submit to create an approved review

## Service Layer

### `ReviewService` (`src/lib/services/reviewService.ts`)

The service layer provides all business logic for review operations:

- `getReviewsByCarId()`: Get reviews for a specific car
- `getAllReviews()`: Get all reviews (admin)
- `getPendingReviews()`: Get pending reviews only
- `createReview()`: Create a new review
- `createAdminReview()`: Create an admin-approved review
- `approveReview()`: Approve a pending review
- `rejectReview()`: Reject and delete a review
- `toggleFeatured()`: Toggle featured status
- `getReviewStats()`: Calculate review statistics

## Security Features

- **Approval System**: All user-submitted reviews require admin approval
- **Input Validation**: Server-side validation for all review data
- **Rate Limiting**: Prevents spam submissions
- **Admin Authentication**: Admin features require authentication

## Styling

The review system uses the existing design system with:
- Dark theme consistent with the car rental platform
- Gradient backgrounds and modern UI elements
- Responsive design for mobile and desktop
- Loading states and error handling

## Testing

Use the provided test script (`test-reviews-api.js`) to verify API functionality:

```bash
node test-reviews-api.js
```

## Future Enhancements

Potential improvements for the review system:

1. **User Authentication**: Require user accounts for reviews
2. **Review Photos**: Allow image uploads with reviews
3. **Review Helpfulness**: Allow users to mark reviews as helpful
4. **Review Replies**: Allow admin responses to reviews
5. **Email Notifications**: Notify admins of new reviews
6. **Review Analytics**: Detailed analytics and reporting
7. **Bulk Operations**: Bulk approve/reject reviews
8. **Review Moderation**: Automated content filtering

## Troubleshooting

### Common Issues

1. **Reviews not appearing**: Check if reviews are approved
2. **API errors**: Verify database connection and schema
3. **Form submission issues**: Check browser console for errors
4. **Admin access denied**: Verify authentication and permissions

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify API endpoints are accessible
3. Check database connection and collections
4. Validate review data format
5. Test with the provided test script
