import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../constants/app_constants.dart';
import '../models/user.dart';
import '../models/upload.dart';
import '../models/client_advertisement.dart';

class ApiService {
  String get baseUrl => AppConstants.apiBaseUrl;
  final Duration timeout;

  ApiService({this.timeout = const Duration(seconds: 120)});

  Map<String, String> get headers => {'Content-Type': 'application/json'};

  Future<User> login(String phoneNumber) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/users/login'),
            headers: headers,
            body: jsonEncode({'phone_number': phoneNumber}),
          )
          .timeout(timeout);

      print('Login Response Status: ${response.statusCode}');
      print('Login Response Body: ${response.body}');

      if (response.statusCode == 200) {
        try {
          final userData = jsonDecode(response.body);
          return User.fromJson(userData);
        } catch (e) {
          throw Exception('Failed to parse user data: ${response.body}');
        }
      } else {
        try {
          final errorData = jsonDecode(response.body);
          throw Exception(errorData['error'] ?? 'Login failed');
        } catch (e) {
          throw Exception(
            'Server error (${response.statusCode}): ${response.body}',
          );
        }
      }
    } on TimeoutException {
      throw Exception('Connection timeout. Please try again.');
    } on SocketException {
      throw Exception('No internet connection. Please check your network.');
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<Map<String, dynamic>> uploadImages(
    String userId,
    List<Map<String, dynamic>> files,
  ) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/uploads'),
      );
      request.fields['user_id'] = userId;

      for (var fileData in files) {
        final file = File(fileData['path']);
        final stream = http.ByteStream(file.openRead());
        final length = await file.length();
        final multipartFile = http.MultipartFile(
          'images',
          stream,
          length,
          filename: fileData['name'],
        );
        request.files.add(multipartFile);
      }

      final streamedResponse = await request.send().timeout(timeout);
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['error'] ?? 'Upload failed');
      }
    } on TimeoutException {
      throw Exception('Upload timeout. Please try again.');
    } on SocketException {
      throw Exception('No internet connection. Please check your network.');
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<Map<String, dynamic>> uploadImagesBase64(
    String userId,
    List<Map<String, dynamic>> files,
  ) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/uploads-base64'),
            headers: headers,
            body: jsonEncode({
              'user_id': userId,
              'files': files
                  .map(
                    (f) => {
                      'name': f['name'],
                      'type': f['type'],
                      'data': f['data'],
                    },
                  )
                  .toList(),
            }),
          )
          .timeout(timeout);

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['error'] ?? 'Upload failed');
      }
    } on TimeoutException {
      throw Exception('Upload timeout. Please try again.');
    } on SocketException {
      throw Exception('No internet connection. Please check your network.');
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<List<Upload>> getUserUploads(String userId) async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/uploads/user/$userId'), headers: headers)
          .timeout(timeout);

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Upload.fromJson(json)).toList();
      } else {
        throw Exception('Failed to fetch uploads');
      }
    } on TimeoutException {
      throw Exception('Connection timeout. Please try again.');
    } on SocketException {
      throw Exception('No internet connection. Please check your network.');
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<List<ClientAdvertisement>> getClientAdvertisements() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/client-advertisements'), headers: headers)
          .timeout(timeout);

      print('Client Ads Response Status: ${response.statusCode}');
      print('Client Ads Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => ClientAdvertisement.fromJson(json)).toList();
      } else {
        throw Exception('Failed to fetch client advertisements');
      }
    } on TimeoutException {
      throw Exception('Connection timeout. Please try again.');
    } on SocketException {
      throw Exception('No internet connection. Please check your network.');
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  String getImageUrl(String imagePath) {
    if (imagePath.isEmpty) return '';

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      print('✅ Image already has full URL: $imagePath');
      return imagePath;
    }

    String cleanPath = imagePath;

    if (cleanPath.contains('/api/assets/')) {
      final index = cleanPath.indexOf('/api/assets/');
      cleanPath = cleanPath.substring(index + 11);
    } else if (cleanPath.contains('/assets/')) {
      final index = cleanPath.indexOf('/assets/');
      cleanPath = cleanPath.substring(index + 8);
    }

    if (!cleanPath.startsWith('/')) {
      cleanPath = '/$cleanPath';
    }

    final finalUrl = 'https://api.clickz.co.no/assets$cleanPath';
    print('🔧 getImageUrl: $imagePath → $finalUrl');
    return finalUrl;
  }
}
