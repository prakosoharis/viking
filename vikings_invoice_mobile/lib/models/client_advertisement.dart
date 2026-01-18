class ClientAdvertisement {
  final String id;
  final String imageUrl;
  final DateTime uploadedAt;

  ClientAdvertisement({
    required this.id,
    required this.imageUrl,
    required this.uploadedAt,
  });

  factory ClientAdvertisement.fromJson(Map<String, dynamic> json) {
    return ClientAdvertisement(
      id: json['_id'] ?? json['id'] ?? '',
      imageUrl: json['image_url'] ?? '',
      uploadedAt: DateTime.parse(
        json['uploaded_at'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'image_url': imageUrl,
      'uploaded_at': uploadedAt.toIso8601String(),
    };
  }
}
