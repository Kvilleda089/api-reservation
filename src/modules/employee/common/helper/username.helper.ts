


export function generateUsername(firstName: string, surname: string): string {
    const firstNameInitial = firstName.charAt(0).toUpperCase();
    const surnameInitial = surname.charAt(0).toUpperCase();
    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    return `${firstNameInitial}${surnameInitial}${randomNumber}`;

} 