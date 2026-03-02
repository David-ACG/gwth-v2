# Unified Workflow — Mermaid Hand-Drawn Demo

Generated: 2026-03-02

## Mermaid Source Code (with handDrawn look)

```mermaid
---
config:
  look: handDrawn
  theme: neutral
---
flowchart TD
    subgraph Sources["Input Sources"]
        A["Phone (Linear)"]
        B["Claude Session"]
        C["Manual .md"]
    end

    D["unified-sync.py\nHourly at :00"]
    E["0_idea/\nRaw Ideas"]

    subgraph Pipeline["Kanban Pipeline"]
        F["1_planning/\nPROMPT_*.md"]
        G["run-kanban.sh"]
        H["Claude Code\nExecutes Prompt"]
        I["2_testing/\nVerify on P520"]
    end

    subgraph Deploy["Deployment"]
        J["P520 Test Server\n192.168.178.50:3001"]
        K["Hetzner Production\ngwth.ai"]
        L["3_done/\nArchived"]
    end

    subgraph Monitor["Monitoring"]
        M["heartbeat.py\nHourly at :30"]
        N["Health Checks"]
        O["Telegram Alerts"]
    end

    A --> D
    B --> E
    C --> E
    D --> E
    E -->|"Triage"| F
    F -->|"Execute"| G
    G --> H
    H -->|"Complete"| I
    I -->|"Verify"| J
    J -->|"promote.sh"| K
    K --> L
    M --> N
    N -->|"Issues"| O
```

## Preview/Edit Link

[Open in Mermaid Chart Editor](https://mermaid.ai/live/edit?utm_source=mermaid_mcp_server&utm_medium=remote_server&utm_campaign=claude#pako:eNp9k1uP0zAQhf-K1SdASkhbLSx5QOr2fq92K14Iqtxk2lh1x5HjbLdQ_jvjOJQGVuTJk-_M8XE8-dGIVQKNsOF5XoSxwp3YhxEyJpU6hCzlmPQ0P6F9ZVI4QsgQCqO5jLBs2Ul1ilOuDVv3rIixvNjuNc9S9qQKHUP-NWqMMSvM7zpqfHNC-3SIrlKFwN7MBALXb2v4gXBX8iIB9gR5LhTWcJfwnGPBJfOPyRUBJhG6ZY8UBYqdgMTLzxj72TmKcERJ5Jlxw8IguLb1SRtsRAL8PWke-YmNae3y_nW0lchAUl7qmHLccry-qeUbEG9uMskRBe6t6-pxOV-tN-9u49pnSEpdoHco3fw8rdHRn8_Qpeuin_4LxIWBnK20Omamph6TurUhaKpNv4AWuzNTlPKuFbz2ma4H60Em1ZkM3OIIWPee2PsiE7Yme7oT_Qyadmh-avnND_d-8-O9fxeE7SBo1tqm1DYC8x1B28RJERt7lxHuTyb1uaiJZyRubxIaChu-o-NUPEPy39hzhcIobcfBrejkNc85oZTGy2yBm3-GoB3UxIsyLZcmZd0U4kN9ZJdE1yCBdj6yjgRt8teydZjnfWbVP_FQFn1XdG-L3m3Rt8WF7LXgexqlCxs4MKhAde2WDB0Zlv0jV4wqWZdmQoLTjR0aV8jNggUTByYVyGiQlIFy9C5s6uC0dJ-5Yl4WC1csqrZxnhf2n76wZePnL2OjSxo)

## Notes

- Uses `look: handDrawn` config which enables RoughJS rendering
- Currently only supported for flowcharts and state diagrams
- The sketch aesthetic is subtle — wobbly lines and organic edges
- Combined with `theme: neutral` for muted colors
- Could be post-processed through Nano Banana 2 for richer visuals
