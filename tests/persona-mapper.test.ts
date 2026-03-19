import { describe, expect, it } from "vitest";
import { animalTypes } from "@/lib/animal-personas";
import { mapSecondMeProfileToPersona } from "@/lib/persona-mapper";

function createInput(overrides?: {
  name?: string;
  bio?: string | null;
  selfIntroduction?: string | null;
  shadeContent?: string;
  factContent?: string;
}) {
  return {
    userInfo: {
      userId: "user-1",
      name: overrides?.name ?? "测试用户",
      avatar: null,
      bio: overrides?.bio ?? null,
      selfIntroduction: overrides?.selfIntroduction ?? null
    },
    shades: overrides?.shadeContent
      ? [
          {
            shadeName: "人格线索",
            shadeContent: overrides.shadeContent
          }
        ]
      : [],
    softMemory: overrides?.factContent
      ? [
          {
            factObject: "记忆",
            factContent: overrides.factContent
          }
        ]
      : []
  };
}

describe("persona mapper", () => {
  it("maps explicit INTJ signals to owl and emits secondme-v4 metadata", () => {
    const mapped = mapSecondMeProfileToPersona(
      createInput({
        selfIntroduction: "我是 INTJ，平时习惯理性分析复杂结构，也喜欢系统、逻辑、未来和设定感。"
      })
    );

    expect(mapped.persona.animalType).toBe("owl");
    expect(mapped.mbtiCandidate).toBe("INTJ");
    expect(mapped.mappingVersion).toBe("secondme-v4");
    expect(mapped.mappingReason).toContain("猫头鹰");
    expect(mapped.rawSecondMeProfile).toMatchObject({
      _agentstory: {
        mappingVersion: "secondme-v4",
        mbtiCandidate: "INTJ"
      }
    });
  });

  it("uses MBTI family boosts when profile text is otherwise sparse", () => {
    const mapped = mapSecondMeProfileToPersona(
      createInput({
        selfIntroduction: "INFJ"
      })
    );

    expect(mapped.persona.animalType).toBe("deer");
    expect(mapped.mbtiCandidate).toBe("INFJ");
    expect(mapped.confidenceScore).toBeGreaterThan(70);
  });

  it("can hit newly added animals from keyword signals", () => {
    const mapped = mapSecondMeProfileToPersona(
      createInput({
        bio: "我总能在海面和现实之间感到流动的灵感，也喜欢自由、异样和带一点回响的场景。",
        factContent: "海、流动、灵感、自由和异样感最能代表我。"
      })
    );

    expect(mapped.persona.animalType).toBe("dolphin");
    expect(mapped.persona.recommendedStyles).toEqual(["魔幻现实主义风", "诗性抒情风", "童话风"]);
  });

  it("falls back deterministically when the profile lacks enough direct signals", () => {
    const input = createInput({
      name: "无特征用户"
    });
    const first = mapSecondMeProfileToPersona(input);
    const second = mapSecondMeProfileToPersona(input);

    expect(animalTypes).toContain(first.persona.animalType);
    expect(second.persona.animalType).toBe(first.persona.animalType);
    expect(first.confidenceScore).toBe(58);
    expect(first.mappingVersion).toBe("secondme-v4");
    expect(first.mappingReason).toContain("资料里可直接映射的人格线索还不多");
  });
});
