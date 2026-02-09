import 'package:flutter/material.dart';

class VikingHelmIcon extends StatelessWidget {
  final double size;
  final Color color;

  const VikingHelmIcon({Key? key, this.size = 64.0, this.color = Colors.blue})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _VikingHelmPainter(color: color)),
    );
  }
}

class _VikingHelmPainter extends CustomPainter {
  final Color color;

  _VikingHelmPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final center = Offset(size.width / 2, size.height / 2);
    final scale = size.width / 100.0;

    canvas.save();
    canvas.translate(center.dx - 50 * scale, center.dy - 50 * scale);
    canvas.scale(scale);

    // Left Horn
    final hornPath1 = Path();
    hornPath1.moveTo(15, 35);
    hornPath1.quadraticBezierTo(10, 25, 8, 15);
    hornPath1.quadraticBezierTo(7, 10, 10, 8);
    hornPath1.quadraticBezierTo(12, 7, 14, 10);
    hornPath1.lineTo(20, 30);
    hornPath1.close();
    canvas.drawPath(hornPath1, paint);

    // Right Horn
    final hornPath2 = Path();
    hornPath2.moveTo(85, 35);
    hornPath2.quadraticBezierTo(90, 25, 92, 15);
    hornPath2.quadraticBezierTo(93, 10, 90, 8);
    hornPath2.quadraticBezierTo(88, 7, 86, 10);
    hornPath2.lineTo(80, 30);
    hornPath2.close();
    canvas.drawPath(hornPath2, paint);

    // Helm Main Body
    final helmRect = RRect.fromRectAndRadius(
      Rect.fromCircle(center: const Offset(50, 55), radius: 32),
      const Radius.circular(32),
    );
    final helmBody = Path();
    helmBody.addOval(Rect.fromCircle(center: const Offset(50, 55), radius: 32));
    canvas.drawPath(helmBody, paint);

    // Face Opening
    final facePaint = Paint()
      ..color = Colors.white.withOpacity(0.9)
      ..style = PaintingStyle.fill;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(35, 50, 30, 25),
        const Radius.circular(3),
      ),
      facePaint,
    );

    // Eye Slits
    final eyePaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(38, 56, 10, 4),
        const Radius.circular(1),
      ),
      eyePaint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTWH(52, 56, 10, 4),
        const Radius.circular(1),
      ),
      eyePaint,
    );

    // Nose Guard
    final noseGuardPath = Path();
    noseGuardPath.moveTo(48, 60);
    noseGuardPath.lineTo(50, 70);
    noseGuardPath.lineTo(52, 60);
    noseGuardPath.close();
    canvas.drawPath(noseGuardPath, paint..color = color.withOpacity(0.8));

    // Rivets
    final rivetPaint = Paint()
      ..color = Colors.white.withOpacity(0.6)
      ..style = PaintingStyle.fill;
    final rivetPositions = [
      const Offset(25, 50),
      const Offset(75, 50),
      const Offset(30, 65),
      const Offset(70, 65),
    ];
    for (final pos in rivetPositions) {
      canvas.drawCircle(pos, 2, rivetPaint);
    }

    // Top Ridge
    final ridgePaint = Paint()
      ..color = Colors.white.withOpacity(0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    final ridgePath = Path();
    ridgePath.moveTo(30, 38);
    ridgePath.quadraticBezierTo(50, 35, 70, 38);
    canvas.drawPath(ridgePath, ridgePaint);

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
