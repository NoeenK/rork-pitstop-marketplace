-- DEMO DATA FOR PITSTOP MARKETPLACE
-- Run this in your Supabase SQL Editor to add sample listings for demonstration
-- This will create test profiles and listings so you can test the app immediately

-- First, let's create some demo user profiles
-- Note: These will need actual auth.users entries, so we'll create profiles that can be associated with real users

-- Demo Listings (using your actual user ID as seller)
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users table

-- You can get your user ID by running: SELECT id FROM auth.users WHERE email = 'your@email.com';

-- Sample listings with various categories and conditions
INSERT INTO listings (
  seller_id,
  title,
  description,
  category,
  condition,
  price_cents,
  is_swap_only,
  city,
  country,
  images,
  season_tag,
  is_active,
  view_count,
  like_count,
  share_count
) VALUES
  -- You need to replace (SELECT id FROM profiles LIMIT 1) with your actual user ID
  -- Or run: SELECT id FROM auth.users WHERE email = 'your@email.com';
  
  (
    (SELECT id FROM profiles ORDER BY created_at DESC LIMIT 1),
    'SDS MK4i Swerve Modules (Set of 4)',
    'Brand new SDS MK4i swerve modules with L2 gearing. Never used, still in original packaging. Perfect for competitive FRC robots. Includes mounting hardware and documentation.',
    'Drivetrain',
    'New',
    320000,
    false,
    'San Jose',
    'USA',
    ARRAY['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'],
    'Crescendo 2024',
    true,
    45,
    12,
    3
  ),
  (
    (SELECT id FROM profiles ORDER BY created_at DESC LIMIT 1),
    'REV Robotics NEO Motor',
    'Lightly used NEO brushless motor. Tested and working perfectly. Great for intakes, shooters, or climbing mechanisms. Comes with mounting screws.',
    'Electronics',
    'Like New',
    4500,
    false,
    'Detroit',
    'USA',
    ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'],
    'Charged Up 2023',
    true,
    67,
    18,
    5
  ),
  (
    (SELECT id FROM profiles ORDER BY created_at DESC LIMIT 1),
    'VersaPlanetary Gearbox 10:1',
    'Used VersaPlanetary gearbox with 10:1 ratio. Some wear but fully functional. Perfect for arm or elevator mechanisms.',
    'Drivetrain',
    'Good',
    2800,
    false,
    'Houston',
    'USA',
    ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    'Rapid React 2022',
    true,
    34,
    8,
    2
  ),
  (
    (SELECT id FROM profiles ORDER BY created_at DESC LIMIT 1),
    'Pneumatic Cylinders (2" Bore)',
    'Set of 4 pneumatic cylinders with 2 inch bore. Great condition, minimal wear. Includes mounting brackets.',
    'Pneumatics',
    'Good',
    8500,
    false,
    'Seattle',
    'USA',
    ARRAY['https://images.unsplash.com/photo-1581092918484-8313e1f6d46d?w=800', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800'],
    NULL,
    true,
    89,
    23,
    7
  ),
  (
    (SELECT id FROM profiles ORDER BY created_at DESC LIMIT 1),
    'Team 254 Pit Banner SWAP',
    'Official Team 254 pit banner from 2023 season. Looking to swap for another top team banner. Excellent condition.',
    'Team Merchandise',
    'Like New',
    NULL,
    true,
    'San Jose',
    'USA',
    ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    'Charged Up 2023',
    true,
    156,
    45,
    12
  ),
  (
    (SELECT id FROM profiles ORDER BY created_at DESC LIMIT 1),
    'AndyMark Wheels (6" Colson)',
    'Set of 6 wheels, 6 inch diameter Colson material. Used for one season, still have plenty of tread left.',
    'Drivetrain',
    'Good',
    7200,
    false,
    'Phoenix',
    'USA',
    ARRAY['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'],
    'Crescendo 2024',
    true,
    78,
    19,
    4
  ),
  (
    (SELECT id FROM profiles ORDER BY created_at DESC LIMIT 1),
    'RoboRIO 2.0',
    'Barely used RoboRIO 2.0 from last season. Fully tested and working. All ports functional, no damage.',
    'Electronics',
    'Like New',
    42500,
    false,
    'Boston',
    'USA',
    ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', 'https://images.unsplash.com/photo-1581092918484-8313e1f6d46d?w=800'],
    'Crescendo 2024',
    true,
    234,
    67,
    15
  ),
  (
    (SELECT id FROM profiles ORDER BY created_at DESC LIMIT 1),
    '1x1 Aluminum Box Tubing (10ft)',
    '1x1 inch aluminum box tubing, 10 feet long, 1/16 inch wall thickness. Brand new, never cut. Perfect for custom frames.',
    'Structure',
    'New',
    3500,
    false,
    'Los Angeles',
    'USA',
    ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    NULL,
    true,
    43,
    11,
    3
  ),
  (
    (SELECT id FROM profiles ORDER BY created_at DESC LIMIT 1),
    'Limelight 2+ Vision Camera',
    'Limelight 2+ camera with all mounting hardware. Used for one season. Firmware up to date, works perfectly for AprilTag detection.',
    'Electronics',
    'Good',
    32000,
    false,
    'Austin',
    'USA',
    ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'],
    'Crescendo 2024',
    true,
    145,
    38,
    9
  ),
  (
    (SELECT id FROM profiles ORDER BY created_at DESC LIMIT 1),
    'Competition Robot Frame SWAP',
    'Complete aluminum frame from 2023 season. Looking to swap for electronics or drivetrain components. Lightweight design, great for building on.',
    'Structure',
    'Good',
    NULL,
    true,
    'Chicago',
    'USA',
    ARRAY['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    'Charged Up 2023',
    true,
    98,
    25,
    6
  ),
  (
    (SELECT id FROM profiles ORDER BY created_at DESC LIMIT 1),
    'Falcon 500 Motor',
    'Used Falcon 500 motor. Tested and working great. Some cosmetic wear but mechanically sound. Perfect for high-performance applications.',
    'Electronics',
    'Good',
    15000,
    false,
    'Dallas',
    'USA',
    ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'],
    'Rapid React 2022',
    true,
    112,
    29,
    7
  ),
  (
    (SELECT id FROM profiles ORDER BY created_at DESC LIMIT 1),
    'Competition Practice Field Elements',
    'Official 2024 Crescendo practice field elements. Includes speaker, amp, and stage. Great condition.',
    'Tools',
    'Good',
    85000,
    false,
    'Miami',
    'USA',
    ARRAY['https://images.unsplash.com/photo-1581092918484-8313e1f6d46d?w=800', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'],
    'Crescendo 2024',
    true,
    267,
    78,
    23
  );

-- Add more realistic view counts, likes, and shares to existing listings
UPDATE listings 
SET 
  view_count = FLOOR(RANDOM() * 200 + 20)::INTEGER,
  like_count = FLOOR(RANDOM() * 50 + 5)::INTEGER,
  share_count = FLOOR(RANDOM() * 15 + 1)::INTEGER
WHERE view_count = 0;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Demo data inserted successfully! You should now see 12 sample listings in the app.';
  RAISE NOTICE 'These listings are associated with your user account, so you can edit or delete them.';
  RAISE NOTICE 'Now you can test messaging by viewing a listing and starting a chat!';
END $$;
