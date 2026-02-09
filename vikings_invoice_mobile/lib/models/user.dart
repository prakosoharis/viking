class User {
  final String id;
  final String phoneNumber;
  final String role;
  final DateTime createdAt;
  final String? companyName;
  final String? orgNr;
  final String? address;
  final String? zipCode;
  final String? companyEmail;
  final DateTime? updatedAt;

  User({
    required this.id,
    required this.phoneNumber,
    required this.role,
    required this.createdAt,
    this.companyName,
    this.orgNr,
    this.address,
    this.zipCode,
    this.companyEmail,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? json['id'] ?? '',
      phoneNumber: json['phone_number'] ?? '',
      role: json['role'] ?? 'user',
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      companyName: json['company_name'],
      orgNr: json['org_nr'],
      address: json['address'],
      zipCode: json['zip_code'],
      companyEmail: json['company_email'],
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'phone_number': phoneNumber,
      'role': role,
      'created_at': createdAt.toIso8601String(),
      'company_name': companyName,
      'org_nr': orgNr,
      'address': address,
      'zip_code': zipCode,
      'company_email': companyEmail,
      'updated_at': updatedAt?.toIso8601String(),
    };
  }
}
