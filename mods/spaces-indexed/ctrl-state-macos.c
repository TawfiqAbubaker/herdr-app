#include <CoreGraphics/CoreGraphics.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <unistd.h>

// Read modifier flags only; no event tap, key capture, or Accessibility access.
static int control_down(void) {
    return (CGEventSourceFlagsState(kCGEventSourceStateCombinedSessionState)
            & kCGEventFlagMaskControl) != 0;
}

int main(int argc, char **argv) {
    if (argc != 2) return 2;
    int previous = atoi(argv[1]); // -1 returns the initial state immediately.
    pid_t parent = getppid();
    struct timespec interval = { .tv_sec = 0, .tv_nsec = 25000000 };
    // A bounded wait avoids an orphaned watcher when the mod reloads. The mod
    // starts another wait after a timeout, without repainting unchanged state.
    for (int i = 0; i < 800; ++i) {
        if (getppid() != parent) return 0;
        int current = control_down();
        if (current != previous) {
            printf("%d\n", current);
            return 0;
        }
        nanosleep(&interval, NULL);
    }
    printf("%d\n", control_down());
    return 0;
}
