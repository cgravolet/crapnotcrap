import 'package:flutter/material.dart';

class TopicCellOption extends StatelessWidget {
  const TopicCellOption({
    Key? key,
    required this.title,
    required this.votes,
    required this.totalVotes,
  }) : super(key: key);

  final String title;
  final int votes;
  final int totalVotes;

  @override
  Widget build(BuildContext context) {
    final fillPercent = votes / totalVotes;
    return Container(
      decoration: _TopicPollDecoration(
        backgroundColor: Theme.of(context).disabledColor,
        foregroundColor: Theme.of(context).selectedRowColor,
        fillPercent: fillPercent,
      ),
      padding: const EdgeInsets.all(8.0),
      child: Row(
        children: [
          Text(title),
          const Spacer(),
          Text(votes.toString()),
        ],
      ),
    );
  }
}

class _TopicPollDecoration extends Decoration {
  const _TopicPollDecoration({
    required this.backgroundColor,
    required this.foregroundColor,
    this.fillPercent = 1.0,
    this.isLeading = false,
  });

  final Color backgroundColor;
  final Color foregroundColor;
  final double fillPercent;
  final bool isLeading;

  @override
  BoxPainter createBoxPainter([VoidCallback? onChanged]) {
    return _TopicPollDecorationPainter(
      backgroundColor: backgroundColor,
      foregroundColor: foregroundColor,
      fillPercent: fillPercent,
    );
  }
}

class _TopicPollDecorationPainter extends BoxPainter {
  _TopicPollDecorationPainter({
    required this.backgroundColor,
    required this.foregroundColor,
    required this.fillPercent,
  });

  final Color backgroundColor;
  final Color foregroundColor;
  final double fillPercent;

  @override
  void paint(Canvas canvas, Offset offset, ImageConfiguration configuration) {
    final size = configuration.size;

    if (size == null) {
      return;
    }
    final Rect bounds = offset & size;
    _drawDecoration(canvas, bounds);
  }

  void _drawDecoration(Canvas canvas, Rect bounds) {
    final Paint backgroundPaint = Paint()..color = backgroundColor;
    final Path backgroundPath = Path();
    backgroundPath.addRect(bounds);
    canvas.drawPath(backgroundPath, backgroundPaint);

    final Paint foregroundPaint = Paint()..color = foregroundColor;
    final Path foregroundPath = Path();
    foregroundPath.addRect(
      Rect.fromLTWH(
        bounds.left,
        bounds.top,
        bounds.width * fillPercent,
        bounds.height,
      ),
    );
    canvas.drawPath(foregroundPath, foregroundPaint);
  }
}
