import {
    Controller,
    Post,
    Body,
    Req,
    UseGuards,
    UnauthorizedException,
    Get,
    Res,
    UsePipes,
    ValidationPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/loginUser.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/auth.guard';
import { CustomRequest } from '../core/request/customRequest';
import { RegisterUserDto } from './dto/registerUser.dto';
import { LogoutDto } from './dto/logout.dto';
import { LogoutResponseDto } from './dto/logoutResponse.dto';
import { ConfigService } from '@nestjs/config';
import { TokenService } from 'src/core/token/token.service';
import { Request } from 'express';
import { ErrorCodes } from 'src/core/handler/error/error-code';

@Controller({ path: 'auth', version: '1' })
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
    private readonly redirectUrl: string;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly tokenService: TokenService,
    ) {
        this.redirectUrl = this.configService.get<string>('REDIRECT_URL');
    }




    @Post('register')
    @ApiOperation({ summary: 'User register' })
    @ApiResponse({
        status: 200,
        description: 'Successful register',
        type: RegisterUserDto,
    })
    @ApiBody({ type: RegisterUserDto })
    @UsePipes(new ValidationPipe({ transform: true }))
    @HttpCode(HttpStatus.OK)
    async register(@Body() registerUserDto: RegisterUserDto) {
        const result = await this.authService.registerUserService(registerUserDto);
        return {
            message: 'Successfully register user!',
            result,
        };
    }

    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({
        status: 200,
        description: 'Successful login',
        type: LoginUserDto,
    })
    @ApiBody({ type: LoginUserDto })
    @UsePipes(new ValidationPipe({ transform: true }))
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginUserDto: LoginUserDto, @Req() req: Request) {
        const result = await this.authService.loginUserService(loginUserDto, req);
        return {
            message: 'Successfully login user!',
            result,
        };
    }

    @Post('logout')
    @ApiOperation({ summary: 'Logout User' })
    @ApiResponse({
        status: 200,
        description: 'Successfully logout',
        type: LogoutResponseDto,
    })
    @ApiBody({ type: LogoutDto })
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: CustomRequest) {
        const userId = req.user?.id;
        const authHeader = req.headers['authorization'];
        const token = authHeader ? authHeader.split(' ')[1] : null;

        if (!userId) {
            throw new UnauthorizedException(ErrorCodes.InvalidCredentials);
        }

        if (!token) {
            throw new UnauthorizedException(ErrorCodes.InvalidCredentials);
        }

        const result = await this.authService.logoutUserService(userId, token);
        return { message: 'Logout successful', result };
    }

    @Post('refresh-token')
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Refresh access token' })
    @ApiBody({ type: String })
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body('refreshToken') refreshToken: string) {
        const result = await this.authService.refreshTokenService(refreshToken);
        return { message: 'Token refreshed', result };
    }

    private async validateAndRedirect(jwt: string, res: any) {
        try {
            await this.tokenService.verifyToken(jwt);
            return await res.redirect(`${this.redirectUrl}?JWT=${jwt}`);
        } catch (error) {
            throw new UnauthorizedException(ErrorCodes.InvalidToken);
        }
    }
}