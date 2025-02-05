import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

const Reviews = ({ product_id }) => {
    const [reviews, setReviews] = useState([]);
    const [ratingFilter, setRatingFilter] = useState(0);
    const [newReview, setNewReview] = useState({
        rating: 5,
        reviewText: '',
        photos: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`/api/reviews/fetchReviewsForProduct/${product_id}`);
                const data = await response.json();
                setReviews(data);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [product_id]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!userId) {
            alert('Please log in to submit a review.');
            return;
        }

        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('product_id', product_id);
        formData.append('rating', newReview.rating);
        formData.append('reviewText', newReview.reviewText);

        selectedFiles.forEach((file, index) => {
            formData.append('photos', file);
        });

        try {
            setIsLoading(true);
            const response = await fetch('/api/reviews/addReview', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            const updatedReviews = await fetch(`/api/reviews/fetchReviewsForProduct/${product_id}`);
            const data = await updatedReviews.json();
            setReviews(data);

            setNewReview({ rating: 5, reviewText: '', photos: [] });
            setSelectedFiles([]);
            setIsLoading(false);
        } catch (err) {
            console.error('Error submitting review:', err);
            setError('Failed to submit review. Please try again.');
            setIsLoading(false);
        }
    };

    const StarRating = ({ rating, interactive = false, onRatingChange = null }) => (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => interactive && onRatingChange?.(star)}
                    className={`focus:outline-none transition-transform ${interactive ? 'hover:scale-110' : ''
                        }`}
                    disabled={!interactive}
                >
                    <Star
                        className={`w-5 h-5 ${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                            }`}
                    />
                </button>
            ))}
        </div>
    );

    const filteredReviews = ratingFilter
        ? reviews.filter((review) => review.rating === ratingFilter)
        : reviews;

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
    );

    if (error) return (
        <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg">
            <p className="font-medium">Error: {error}</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
                    Customer Reviews ({reviews.length})
                </h2>

                <div className="w-full md:w-48">
                    <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black text-sm"
                    >
                        <option value={0}>All Ratings</option>
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <option key={rating} value={rating}>
                                {rating} {rating === 1 ? 'Star' : 'Stars'}
                                ({reviews.filter(r => r.rating === rating).length})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-6">
                {filteredReviews.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-600 text-lg">No reviews found.</p>
                    </div>
                ) : (
                    filteredReviews.map((review) => (
                        <div key={review._id} className="bg-gray-50 rounded-lg p-6 transition-shadow hover:shadow-md">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {review.user_id?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg font-semibold text-gray-900">
                                        {review.user_id?.name || 'Anonymous'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <StarRating rating={review.rating} />
                                <p className="mt-3 text-gray-700 whitespace-pre-wrap">
                                    {review.reviewText}
                                </p>
                                {review.photos && review.photos.length > 0 && (
                                    <div className="mt-4 flex space-x-4">
                                        {review.photos.map((photo, index) => (
                                            <img
                                                key={index}
                                                src={photo}
                                                alt={`Review photo ${index + 1}`}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                        ))}
                                    </div>
                                )}
                                {review.verifiedPurchase && (
                                    <span className="inline-flex items-center mt-3 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                        ✓ Verified Purchase
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {userId ? (
                <div className="mt-10 border-t border-gray-200 pt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Write a Review
                    </h3>
                    <form onSubmit={handleSubmitReview} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating
                            </label>
                            <StarRating
                                rating={newReview.rating}
                                interactive={true}
                                onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Review
                            </label>
                            <textarea
                                value={newReview.reviewText}
                                onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })}
                                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black min-h-[120px] text-base"
                                placeholder="Share your experience with this product..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Photos (Optional)
                            </label>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black text-base"
                                accept="image/*"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full md:w-auto mb-4 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-base font-medium"
                        >
                            {isLoading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="mt-10 bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-600 text-lg">
                        Please log in to write a review.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Reviews;