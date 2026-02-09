import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  static String get apiBaseUrl {
    final envUrl = dotenv.env['API_BASE_URL'];
    return envUrl ?? 'https://api.clickz.co.no/api';
  }

  static const String storageKeyCurrentUser = 'invoice_current_user';
  static const int maxFiles = 10;
  static const int minFiles = 1;
}
