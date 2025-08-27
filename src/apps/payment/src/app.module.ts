import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PayController } from "./pay/pay.controller";
import { PayService } from "./pay/pay.service";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [PayController],
  providers: [PayService],
})
export class AppModule {}
