import { collection, getDocs, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile } from "../../types";

export interface AdminStats {
    totalStudents: number;
    activeInternships: number; // Placeholder, maybe count from separate collection later
    avgReadiness: number;
    resumesVerified: number;
}

export const getAllUsers = async (): Promise<UserProfile[]> => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
        // Basic validation to ensure data integrity
        const data = doc.data() as UserProfile;
        if (data.email && data.name) {
            users.push(data);
        }
    });
    return users;
};

export const calculateStats = (users: UserProfile[]) => {
    const roleDistribution: Record<string, number> = {};
    let totalReadiness = 0;
    let studentsWithReadiness = 0;

    // Placement Funnel (Inferred)
    const placementStats = {
        Placed: 0,
        Preparing: 0,
        AtRisk: 0
    };

    const riskList: { name: string; role: string; progress: number; days: number; status: string }[] = [];

    users.forEach(user => {
        // Role Distribution
        const role = user.targetRole || 'Undecided';
        roleDistribution[role] = (roleDistribution[role] || 0) + 1;

        // Readiness / Progress
        let progress = 0;
        if (user.questProgress) {
            // Simple heuristic: level * 10
            progress = Math.min((user.questProgress.userLevel || 1) * 10, 100);
            totalReadiness += progress;
            studentsWithReadiness++;
        }

        // Placement Funnel Logic
        if (user.currentLevel === 'Advanced' || progress > 80) {
            placementStats.Placed++;
        } else if (progress < 20) {
            placementStats.AtRisk++;

            // Add to risk list
            riskList.push({
                name: user.name,
                role: user.targetRole || 'N/A',
                progress: progress,
                days: 30, // Mock "days left" for now
                status: progress < 10 ? 'Critical' : 'Behind'
            });

        } else {
            placementStats.Preparing++;
        }
    });

    // Calculate Average Readiness
    const avgReadiness = studentsWithReadiness > 0 ? Math.round(totalReadiness / studentsWithReadiness) : 0;

    // Format Text Stats
    const adminStats: AdminStats = {
        totalStudents: users.length,
        activeInternships: 45, // Placeholder constant for now
        avgReadiness: avgReadiness,
        resumesVerified: users.filter(u => u.atsScore && u.atsScore > 70).length
    };

    // Format Chart Data
    const roleChartData = Object.keys(roleDistribution).map(role => ({
        name: role,
        count: roleDistribution[role],
        color: getColorForRole(role)
    }));

    const placementChartData = [
        { name: 'Placed', value: placementStats.Placed, color: '#10b981' },
        { name: 'Preparing', value: placementStats.Preparing, color: '#3b82f6' },
        { name: 'At Risk', value: placementStats.AtRisk, color: '#ef4444' },
    ];

    return {
        adminStats,
        roleChartData,
        placementChartData,
        riskList: riskList.slice(0, 10) // Top 10 at risk
    };
};

const getColorForRole = (role: string) => {
    const colors: Record<string, string> = {
        'SDE': '#4f46e5',
        'Data Analyst': '#06b6d4',
        'UI/UX': '#a855f7',
        'Product': '#f97316'
    };
    return colors[role] || '#64748b'; // Default gray
};
