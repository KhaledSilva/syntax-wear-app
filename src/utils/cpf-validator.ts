
export function isValidCPF(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, "");

    // Deve ter 11 dígitos
    if (cleaned.length !== 11) {
        return false;
    }

    // Rejeita CPFs com todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(cleaned)) {
        return false;
    }

    const digits = cleaned.split("").map(Number);

    // Calcula o primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += digits[i] * (10 - i);
    }

    let firstDigit = (sum * 10) % 11;
    if (firstDigit === 10) {
        firstDigit = 0;
    }

    if (firstDigit !== digits[9]) {
        return false;
    }

    // Calcula o segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += digits[i] * (11 - i);
    }

    let secondDigit = (sum * 10) % 11;
    if (secondDigit === 10) {
        secondDigit = 0;
    }

    return secondDigit === digits[10];
}