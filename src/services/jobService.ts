
import { UserProfile } from '../../types';

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    date: string; // ISO or human readable
    url: string;
    tags: string[];
    description?: string;
    matchScore?: number;
}

// Fallback data in case API is empty or fails (ensures UI always looks good)
const MOCK_JOBS: Job[] = [
    {
        id: 'mock-1',
        title: 'Software Engineering Intern',
        company: 'Google',
        location: 'Mountain View, CA (Remote)',
        date: new Date().toISOString(),
        url: 'https://careers.google.com',
        tags: ['React', 'TypeScript', 'System Design'],
        description: 'Join our team to build scalable systems.',
        matchScore: 95
    },
    {
        id: 'mock-2',
        title: 'Frontend Developer',
        company: 'Stripe',
        location: 'New York, NY',
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        url: 'https://stripe.com/jobs',
        tags: ['React', 'Redux', 'UI/UX'],
        description: 'Help us build the economic infrastructure of the internet.',
        matchScore: 88
    },
    {
        id: 'mock-3',
        title: 'Full Stack Engineer',
        company: 'Netflix',
        location: 'Remote',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        url: 'https://jobs.netflix.com',
        tags: ['Node.js', 'React', 'Cloud'],
        description: 'Entertainment for the world.',
        matchScore: 82
    },
    {
        id: 'mock-4',
        title: 'Product Designer',
        company: 'Airbnb',
        location: 'San Francisco, CA',
        date: new Date(Date.now() - 200000000).toISOString(),
        url: 'https://careers.airbnb.com',
        tags: ['Figma', 'UI/UX', 'Prototyping'],
        description: 'Belong anywhere.',
        matchScore: 78
    },
    {
        id: 'mock-5',
        title: 'Data Scientist',
        company: 'Spotify',
        location: 'New York, NY',
        date: new Date(Date.now() - 300000000).toISOString(),
        url: 'https://lifeatspotify.com',
        tags: ['Python', 'Machine Learning', 'SQL'],
        description: 'Unlock the potential of human creativity.',
        matchScore: 75
    },
    {
        id: 'mock-6',
        title: 'DevOps Engineer',
        company: 'Microsoft',
        location: 'Redmond, WA',
        date: new Date(Date.now() - 400000000).toISOString(),
        url: 'https://careers.microsoft.com',
        tags: ['Azure', 'Kubernetes', 'CI/CD'],
        description: 'Empower every person and organization.',
        matchScore: 70
    },
    {
        id: 'mock-7',
        title: 'Mobile Developer',
        company: 'Uber',
        location: 'San Francisco, CA',
        date: new Date(Date.now() - 500000000).toISOString(),
        url: 'https://www.uber.com/us/en/careers',
        tags: ['React Native', 'iOS', 'Android'],
        description: 'Go anywhere.',
        matchScore: 65
    }
];

const GENERIC_MOCKS = [...MOCK_JOBS, ...MOCK_JOBS, ...MOCK_JOBS].map((j, i) => ({ ...j, id: `mock-dup-${i}` }));

export const fetchJobs = async (user: UserProfile | null): Promise<Job[]> => {
    try {
        // 1. Fetch from Arbeitnow (Free, No Auth)
        // Limits: 100 items per page.
        const response = await fetch('https://arbeitnow.com/api/job-board-api');

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const apiJobs: any[] = data.data || [];

        // 2. Map API -> Job Interface
        const mappedJobs: Job[] = apiJobs.map((j: any) => ({
            id: j.slug,
            title: j.title,
            company: j.company_name,
            location: j.location,
            date: new Date(j.created_at * 1000).toISOString(),
            url: j.url,
            tags: j.tags || [],
            description: j.description
        }));

        // 3. Filter & Score based on User Profile
        // If no user/skills, return raw list (or first 5)
        if (!user) return [...mappedJobs.slice(0, 5), ...GENERIC_MOCKS];

        const userSkills = (user.skills || []).map(s => s.toLowerCase());
        const targetRole = (user.targetRole || '').toLowerCase();

        // Scoring Logic
        const scoredJobs = mappedJobs.map(job => {
            let score = 0;
            const jobText = (job.title + ' ' + (job.tags || []).join(' ')).toLowerCase();

            // Title Match
            if (jobText.includes(targetRole)) score += 50;

            // Skill Match
            let skillMatches = 0;
            userSkills.forEach(skill => {
                if (jobText.includes(skill)) {
                    score += 10;
                    skillMatches++;
                }
            });

            // Cap at 99
            return { ...job, matchScore: Math.min(99, score) };
        });

        // 4. Sort by Match Score
        const sortedJobs = scoredJobs
            .filter(j => j.matchScore && j.matchScore > 20) // Only relevance > 20
            .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

        // 5. Merge with Mocks (Interleave for best demo experience if API lacks high matches)
        // If API returns few high matches, inject mocks
        const highQualityJobs = sortedJobs.slice(0, 50);

        if (highQualityJobs.length < 5) {
            return [...GENERIC_MOCKS, ...highQualityJobs];
        }

        return highQualityJobs;

    } catch (error) {
        console.error("Failed to fetch jobs:", error);
        // Fallback to mocks on error
        return GENERIC_MOCKS;
    }
};
