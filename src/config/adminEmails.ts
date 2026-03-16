export const ADMIN_EMAILS = [
    "adityaacharya.m777@gmail.com", // Replace with actual admin emails
    "admin@pathpilot.ai"
];

export const isAdmin = (email?: string | null): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email);
};
