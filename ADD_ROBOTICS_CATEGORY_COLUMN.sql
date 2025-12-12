-- Add robotics_category column to listings table
-- This allows filtering listings by FRC, FTC, or FLL

ALTER TABLE listings
ADD COLUMN IF NOT EXISTS robotics_category TEXT DEFAULT 'FRC';

-- Add a check constraint to ensure valid values
ALTER TABLE listings
ADD CONSTRAINT valid_robotics_category 
CHECK (robotics_category IN ('FRC', 'FTC', 'FLL'));

-- Create an index for better performance when filtering by robotics category
CREATE INDEX IF NOT EXISTS idx_listings_robotics_category ON listings(robotics_category);

-- Update existing listings to have 'FRC' as default
UPDATE listings
SET robotics_category = 'FRC'
WHERE robotics_category IS NULL;
