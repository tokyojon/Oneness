import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, all

    // Calculate date range
    let startDate: Date;
    const now = new Date();

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date('2020-01-01'); // Far in the past for 'all'
    }

    // Get seller's ads
    const { data: ads, error: adsError } = await supabase
      .from('marketplace_ads')
      .select('*')
      .eq('user_id', user.id);

    if (adsError) {
      console.error('Seller ads fetch error:', adsError);
      return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
    }

    const adIds = ads?.map(ad => ad.id) || [];

    if (adIds.length === 0) {
      return NextResponse.json({
        overview: {
          totalAds: 0,
          activeAds: 0,
          totalViews: 0,
          totalClicks: 0,
          totalLikes: 0,
          totalComments: 0,
          totalOffers: 0
        },
        ads: [],
        trends: []
      });
    }

    // Get analytics data for all ads
    const [viewsData, clicksData, likesData, commentsData, offersData] = await Promise.all([
      supabase
        .from('marketplace_ad_views')
        .select('ad_id, viewed_at')
        .in('ad_id', adIds)
        .gte('viewed_at', startDate.toISOString()),

      supabase
        .from('marketplace_ad_clicks')
        .select('ad_id, clicked_at')
        .in('ad_id', adIds)
        .gte('clicked_at', startDate.toISOString()),

      supabase
        .from('marketplace_ad_likes')
        .select('ad_id, created_at')
        .in('ad_id', adIds)
        .gte('created_at', startDate.toISOString()),

      supabase
        .from('marketplace_ad_comments')
        .select('ad_id, created_at')
        .in('ad_id', adIds)
        .gte('created_at', startDate.toISOString()),

      supabase
        .from('marketplace_offers')
        .select('ad_id, created_at')
        .in('ad_id', adIds)
        .gte('created_at', startDate.toISOString())
    ]);

    // Calculate overview metrics
    const overview = {
      totalAds: ads?.length || 0,
      activeAds: ads?.filter(ad => ad.status === 'active').length || 0,
      totalViews: viewsData.data?.length || 0,
      totalClicks: clicksData.data?.length || 0,
      totalLikes: likesData.data?.length || 0,
      totalComments: commentsData.data?.length || 0,
      totalOffers: offersData.data?.length || 0
    };

    // Calculate per-ad metrics
    const adsWithMetrics = ads?.map(ad => {
      const adViews = viewsData.data?.filter(v => v.ad_id === ad.id).length || 0;
      const adClicks = clicksData.data?.filter(c => c.ad_id === ad.id).length || 0;
      const adLikes = likesData.data?.filter(l => l.ad_id === ad.id).length || 0;
      const adComments = commentsData.data?.filter(c => c.ad_id === ad.id).length || 0;
      const adOffers = offersData.data?.filter(o => o.ad_id === ad.id).length || 0;

      return {
        id: ad.id,
        title: ad.title,
        status: ad.status,
        created_at: ad.created_at,
        metrics: {
          views: adViews,
          clicks: adClicks,
          likes: adLikes,
          comments: adComments,
          offers: adOffers,
          ctr: adViews > 0 ? (adClicks / adViews) * 100 : 0 // Click-through rate
        }
      };
    }) || [];

    // Calculate trends (daily metrics for the period)
    const trends = [];
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const dayViews = viewsData.data?.filter(v =>
        v.viewed_at.startsWith(dateStr)
      ).length || 0;

      const dayClicks = clicksData.data?.filter(c =>
        c.clicked_at.startsWith(dateStr)
      ).length || 0;

      trends.push({
        date: dateStr,
        views: dayViews,
        clicks: dayClicks
      });
    }

    return NextResponse.json({
      overview,
      ads: adsWithMetrics,
      trends
    });

  } catch (error) {
    console.error('Seller analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
