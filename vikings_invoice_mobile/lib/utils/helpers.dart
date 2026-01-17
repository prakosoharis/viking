import 'dart:io';
import 'dart:convert';
import 'package:intl/intl.dart';

class FileUtils {
  static Future<String> fileToBase64(String filePath, String mimeType) async {
    try {
      final file = File(filePath);
      final bytes = await file.readAsBytes();
      final base64 = base64Encode(bytes);
      return 'data:$mimeType;base64,$base64';
    } catch (e) {
      throw Exception('Failed to convert file to base64: $e');
    }
  }

  static String formatFileSize(int bytes) {
    if (bytes < 1024) {
      return '$bytes B';
    } else if (bytes < 1024 * 1024) {
      final kb = (bytes / 1024).toStringAsFixed(1);
      return '$kb KB';
    } else {
      final mb = (bytes / (1024 * 1024)).toStringAsFixed(1);
      return '$mb MB';
    }
  }

  static bool isPdfFile(String fileName) {
    return fileName.toLowerCase().endsWith('.pdf');
  }
}

class AppDateUtils {
  static String formatDate(DateTime date) {
    return DateFormat('MMM d, y • h:mm a').format(date.toLocal());
  }

  static String formatShortDate(DateTime date) {
    return DateFormat('MMM d, y').format(date.toLocal());
  }
}
