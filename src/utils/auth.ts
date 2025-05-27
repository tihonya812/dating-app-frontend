export function saveToken(token: string, role: string): void { // Обновляем saveToken, добавляя role
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
}

export function getToken(): string | null {
    return localStorage.getItem("token");
}

export function getRole(): string | null { // Добавляем getRole
    return localStorage.getItem("role");
}

export function removeToken(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
}