class Upload {
  final String id;
  final String userId;
  final String imageUrl;
  final DateTime uploadedAt;
  final String status;
  final int sessionNumber;
  final String emailStatus;
  final DateTime? emailSentAt;
  final String? emailError;
  final String? emailId;

  Upload({
    required this.id,
    required this.userId,
    required this.imageUrl,
    required this.uploadedAt,
    required this.status,
    required this.sessionNumber,
    this.emailStatus = 'pending',
    this.emailSentAt,
    this.emailError,
    this.emailId,
  });

  factory Upload.fromJson(Map<String, dynamic> json) {
    return Upload(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['user_id'] ?? '',
      imageUrl: json['image_url'] ?? '',
      uploadedAt: json['uploaded_at'] != null
          ? DateTime.parse(json['uploaded_at'])
          : DateTime.now(),
      status: json['status'] ?? 'completed',
      sessionNumber: json['session_number'] ?? 1,
      emailStatus: json['email_status'] ?? 'pending',
      emailSentAt: json['email_sent_at'] != null
          ? DateTime.parse(json['email_sent_at'])
          : null,
      emailError: json['email_error'],
      emailId: json['email_id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'user_id': userId,
      'image_url': imageUrl,
      'uploaded_at': uploadedAt.toIso8601String(),
      'status': status,
      'session_number': sessionNumber,
      'email_status': emailStatus,
      'email_sent_at': emailSentAt?.toIso8601String(),
      'email_error': emailError,
      'email_id': emailId,
    };
  }
}

class UploadSession {
  final int sessionNumber;
  final List<Upload> uploads;
  final DateTime uploadedAt;

  UploadSession({
    required this.sessionNumber,
    required this.uploads,
    required this.uploadedAt,
  });

  String get emailStatus {
    if (uploads.isEmpty) return 'pending';
    return uploads.first.emailStatus;
  }
}
