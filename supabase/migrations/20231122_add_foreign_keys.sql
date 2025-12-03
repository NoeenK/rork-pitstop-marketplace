-- Add foreign key from listings to profiles
ALTER TABLE public.listings
ADD CONSTRAINT fk_listings_seller
FOREIGN KEY (seller_id) 
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Add foreign key from reviews to profiles for reviewer
ALTER TABLE public.reviews
ADD CONSTRAINT fk_reviews_reviewer
FOREIGN KEY (reviewer_id) 
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Add foreign key from reviews to profiles for reviewee
ALTER TABLE public.reviews
ADD CONSTRAINT fk_reviews_reviewee
FOREIGN KEY (reviewee_id) 
REFERENCES public.profiles(id)
ON DELETE CASCADE;
