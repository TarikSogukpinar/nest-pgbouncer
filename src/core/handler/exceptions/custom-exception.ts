import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
    constructor() {
        super("User doesn't exist", HttpStatus.NOT_FOUND);
    }
}

export class InvalidCredentialsException extends HttpException {
    constructor() {
        super('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
}

export class EmailNotFoundException extends HttpException {
    constructor() {
        super("Email doesn't exist", HttpStatus.NOT_FOUND);
    }
}

export class UserAlreadyExistsException extends HttpException {
    constructor() {
        super('User already exists', HttpStatus.CONFLICT);
    }
}
